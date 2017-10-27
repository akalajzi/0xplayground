import Web3 from 'web3'
import moment from 'moment'
import _ from 'lodash'

import { connectZeroEx, mapTokenList, mapLog } from 'src/components/blockchain/helper'
import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'
import API from 'src/const/api'
import { getFiatValue } from 'src/util/marketApi'

const GraphQLClient = require('graphql-request').GraphQLClient

const NETWORK = {
  id: 1,
  infura: INFURA.MAINNET,
}

export default class Blockchain {
  constructor() {
    this.zeroEx = connectZeroEx(NETWORK.infura)
    // use web3 from ZeroEx
    this.web3 = this.zeroEx._web3Wrapper.web3
    this.web3Sync = new Web3(new Web3.providers.HttpProvider(NETWORK.infura))

    this.networkId = null
    this.blockHeight = null
    this.tokens = null
    this.lastFetchedBlock = null
    this.latestTrades = null
    this.graphqlClient = new GraphQLClient(API.graphcool.simple, {
      headers: {
        // Authorization: 'Bearer YOUR_AUTH_TOKEN',
      },
    })
  }

  initialFetch() {
    // console.log('Blockchain initial fetch starting!');
    this.getTokens().then((res) => { this.tokens = mapTokenList(res.allTokens) })
    this.getLatestTrades().then((res) => { this.latestTrades = res.allTrades })
    this.getBlockchainInfo()
    .then((res) => {
      this.blockchainInfo = res.allBlockchainInfoes
      this.networkId = _.find(this.blockchainInfo, item => item.name === 'networkId').value
      this.blockHeight = _.find(this.blockchainInfo, item => item.name === 'blockHeight').value

      // this.fetchNetworkId(this.web3)
      this.fetchBlockHeight()
    })
    .catch((err) => {
      console.error('getBlockchainInfo failed ', err)
    })
  }

  fetchNetworkId = (web3) => {
    if (web3.version) {
      web3.version.getNetwork((err, res) => {
        if (err) {
          console.error('Error fetching network version ', err);
        } else {
          this.networkId = res
          this.setInfoItem('networkId', res)
        }
      })
    }
  }

  fetchBlockHeight = () => {
    this.web3.eth.getBlockNumber((err, res) => {
      if (err) {
        console.log('Error getting block number ', err);
      } else {
        this.blockHeight = res
        this.setInfoItem('blockHeight', res)
        this.fetch24hTrades()
      }
    })
  }

  fetch24hTrades = (dailylogs = [], i = 1) => { // iterator is just a control factor, remove later
    const now = moment().utc()
    const startTime = now.subtract(24, 'hours').unix()
    // subscribe for ongoing trades
    this.zeroEx.exchange.subscribeAsync("LogFill", {}, this.handleLogFillEvent.bind(this, null))

    const toBlock = this.lastFetchedBlock || this.blockHeight
    const fromBlock = toBlock - ETH.TRADE_BATCH_BLOCKS
    this.processLogBatch(fromBlock, toBlock, startTime)
    .then(({ mappedLogs, overTheLimit}) => {
      const collectedLogs = dailylogs.concat(mappedLogs)
      if (!overTheLimit) {
        this.fetch24hTrades(collectedLogs, i + 1)
      } else {
        // console.log('24 HOURS LOGGED: ', collectedLogs)
        _.forEach(collectedLogs, (log) => {
          this.setLatestTrades(log)
          .catch((err) => {
            console.error('setLatestTrades catch.')
          })
        })
      }
    })
    .catch((err) => {
      console.error("processLogBatch failed", err)
    })
  }

  processLogBatch = (fromBlock, toBlock, startTime) => {
    return new Promise ( resolve =>
      this.zeroEx.exchange.getLogsAsync("LogFill", { fromBlock, toBlock }, {})
      .then((logs) => {
        let mappedLogs = []
        let overTheLimit = false
        this.lastFetchedBlock = fromBlock

        if (logs.length === 0) {
          resolve({mappedLogs, overTheLimit: false})
          return
        }

        this.getTimestampsForBatch(logs)
        .then((result) => {
          _.forEach(logs, (log, i) => {
            const matchedBlock = _.find(result, (block) => block.hash === log.blockHash)

            if (matchedBlock.timestamp >= startTime) {
              log['timestamp'] = matchedBlock.timestamp
              mappedLogs.push(mapLog(log, this.tokens))
            } else {
              overTheLimit = true
            }
          })
          resolve({mappedLogs, overTheLimit})
        })
        .catch((err) => {
          console.error('getTimestampsForBatch failed. ', err)
        })
      })
    )
  }

  getTimestampsForBatch = (logs) => {
    let batch = []
    _.forEach(logs, (log, i) => {
      const currentBlock = this.web3.toDecimal(log.blockNumber)
      // zeroEx wrapped web3 only allows callback calls; this returns promise
      batch.push(this.web3Sync.eth.getBlock(currentBlock))
    })
    return Promise.all(batch)
  }

  handleLogFillEvent = (err, log) => {
    console.log('New trade received');
    if (_.find(this.latestTrades, trade => trade.transactionHash === log.transactionHash )) {
      // skip transactions we already handled, if they somehow get here
      return null
    }
    const currentBlock = this.web3.toDecimal(log.blockNumber)
    this.web3Sync.eth.getBlock(currentBlock)
    .then((block) => {
      if (!block) {
        console.error('Block search after LogFill returned empty.')
        return
      }
      log['timestamp'] = block.timestamp
      const mappedLog = mapLog(log, this.tokens)
      this.setLatestTrades(mappedLog)
    })
  }

  getBlockchainInfo = () => {
    const query = `
      query BlockchainInfo {
        allBlockchainInfoes {
          id
          name
          value
        }
      }
    `
    return this.graphqlClient.request(query)
  }

  setInfoItem = (name, value) => {
    const id = _.find(this.blockchainInfo, item => item.name === name).id
    const query = `
      mutation updateBlockchainInfo($id: ID!, $name: String!, $value: String!) {
        updateBlockchainInfo(id: $id, name: $name, value: $value) {
          id
          name
          value
        }
      }
    `
    return this.graphqlClient.request(query, {id, name, value: value.toString() })
  }

  getTokens = () => {
    const query = `
      query Tokens {
        allTokens {
          id
          name
          symbol
          address
          decimals
        }
      }
    `
    return this.graphqlClient.request(query)
  }

  getLatestTrades = () => {
    const query = `
      query Trades {
        allTradeses(
          orderBy: timestamp_DESC
        ) {
          id
          address
          timestamp
          blockNumber
          transactionHash
          transactionIndex
          blockHash
          event
          removed
          filledMakerTokenAmountNormalized
          filledTakerTokenAmountNormalized
          price
          invertedPrice
          args
        }
      }
    `
    return this.graphqlClient.request(query)
  }

  setLatestTrades = (trade) => {
    const query = `mutation createTrades(
      $address: String,
      $timestamp: Int,
      $blockNumber: String,
      $transactionHash: String!,
      $transactionIndex: String,
      $blockHash: String,
      $event: String,
      $removed: Boolean,
      $filledMakerTokenAmountNormalized: Float,
      $filledTakerTokenAmountNormalized: Float,
      $price: Float,
      $invertedPrice: Float,
      $args: Json,
    ) {
      createTrades(
        address: $address,
        args: $args,
        blockHash: $blockHash,
        blockNumber: $blockNumber,
        event: $event,
        filledMakerTokenAmountNormalized: $filledMakerTokenAmountNormalized,
        filledTakerTokenAmountNormalized: $filledTakerTokenAmountNormalized,
        invertedPrice: $invertedPrice,
        price: $price,
        removed: $removed,
        timestamp: $timestamp,
        transactionHash: $transactionHash,
        transactionIndex: $transactionIndex,
      ) {
        id
        address
        timestamp
        blockNumber
        transactionHash
        transactionIndex
        blockHash
        event
        removed
        filledMakerTokenAmountNormalized
        filledTakerTokenAmountNormalized
        price
        invertedPrice
        args
      }
    }`
    return this.graphqlClient.request(query, trade)
  }

  // startPolling() {
  //   this.pollInterval = setInterval(() => {
  //     console.log('polling...')
  //     this.counter += 1
  //   }, 2000)
  // }
  //
  // stopPolling() {
  //   clearInterval(this.pollInterval)
  // }

}
