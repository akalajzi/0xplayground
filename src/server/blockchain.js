this.logInDebugimport Web3 from 'web3'
import moment from 'moment'
import _ from 'lodash'
import axios from 'axios'
import BigNumber from 'bignumber.js'

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

    // history trades fetch
    this.historyStartDate = null
    this.hStart = null

    // history calculations
    this.offset = 86400 // 1 day in seconds
    this.startTimestamp = 1502928001 // 17.08.2017.
    this.now = moment().utc().unix()
    this.historyDone = false
    this.hBucketStart = this.startTimestamp

    //
    this.allTrades = null
    this.marketInterval = null // market polling interval
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

  logInDebug = (one, two = '', three = '', four = '', five = '') => {
    if (process.env.DEBUG) {
      console.log(one, two, three, four, five);
    }
  }

  initialFetch() {
    // this.logInDebug('Blockchain initial fetch starting!');
    this.getTokens().then((res) => { this.tokens = mapTokenList(res.allTokens) })
    this.getLatestTrades().then((res) => {
      this.latestTrades = res.allTradeses // not a typo :)
      // history calculations
      // this.allTrades = res.allTradeses
      // if (this.allTrades) {
      //   this.calculateHistory()
      // } else {
      //   this.logInDebug('No trades fetched!');
      // }
    })
    //
    this.getBlockchainInfo()
    .then((res) => {
      this.blockchainInfo = res.allBlockchainInfoes
      this.networkId = _.find(this.blockchainInfo, item => item.name === 'networkId').value
      this.blockHeight = _.find(this.blockchainInfo, item => item.name === 'blockHeight').value

      // store ZRX and ETH to USD market prices in graphql for faster initial load
      this.startPollingForMarketPrices()
      // NETWORK id is 1 pretty much forever
      // this.fetchNetworkId(this.web3)
      this.fetchBlockHeight()

      // subscribe for ongoing trades
      this.zeroEx.exchange.subscribeAsync("LogFill", {}, this.handleLogFillEvent.bind(this, null))
    })
    .catch((err) => {
      this.logInDebug('getBlockchainInfo failed ', err)
    })
  }

  getTradesForDate = (date) => {
    //
  }

  calculateHistorySinceDate = (date) => {
    this.getLatestTrades().then((res) => {
      this.allTrades = res.allTradeses // not a typo :)

      const start = moment.utc(date, 'YYYYMMDD').startOf('day').unix()
      const end = moment.utc(date, 'YYYYMMDD').endOf('day').unix()
      this.fetchHistoryForBucket(start + 1, end, true)
    })
  }

  fetchNetworkId = (web3) => {
    if (web3.version) {
      web3.version.getNetwork((err, res) => {
        if (err) {
          this.logInDebug('Error fetching network version ', err);
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
        this.logInDebug('Error getting block number ', err);
      } else {
        this.blockHeight = res
        this.setInfoItem('blockHeight', res)
        this.fetch24hTrades()
      }
    })
  }

  fetch24hTrades = (dailylogs = [], i = 1) => { // iterator is just a control factor, remove later
    const now = moment().utc()
    // going for 12 hours now, since at least one backend is always on
    const startTime = now.subtract(12, 'hours').unix()

    const toBlock = this.lastFetchedBlock || this.blockHeight
    const fromBlock = toBlock - ETH.TRADE_BATCH_BLOCKS
    this.processLogBatch(fromBlock, toBlock, startTime)
    .then(({ mappedLogs, overTheLimit}) => {
      const collectedLogs = dailylogs.concat(mappedLogs)
      if (!overTheLimit) {
        this.fetch24hTrades(collectedLogs, i + 1)
      } else {
        _.forEach(collectedLogs, (log) => {
          this.setLatestTrades(log)
          .catch((err) => {
            this.logInDebug('setLatestTrades catch.')
          })
        })
      }
    })
    .catch((err) => {
      this.logInDebug("processLogBatch failed", err)
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
          this.logInDebug('getTimestampsForBatch failed. ', err)
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

  getGasUsedAndPriceForTransaction = (transaction) => {
    const transactionHash = transaction.transactionHash
    return Promise.all([
      this.web3Sync.eth.getTransactionReceipt(transactionHash),
      this.web3Sync.eth.getTransaction(transactionHash)
    ])
  }

  handleLogFillEvent = (err, log) => {
    this.logInDebug('New trade received');
    if (_.find(this.latestTrades, trade => trade.transactionHash === log.transactionHash )) {
      // skip transactions we already handled, if they somehow get here
      return null
    }
    const currentBlock = this.web3.toDecimal(log.blockNumber)
    this.web3Sync.eth.getBlock(currentBlock)
    .then((block) => {
      if (!block) {
        this.logInDebug('Block search after LogFill returned empty.')
        return
      }
      log['timestamp'] = block.timestamp
      this.getGasUsedAndPriceForTransaction(log)
      .then((res) => {
        log['gasUsed'] = res[0].gasUsed
        log['gasPrice'] = new BigNumber(res[1].gasPrice).div(10**9).toNumber()
        const mappedLog = mapLog(log, this.tokens)
        this.setLatestTrades(mappedLog)
      })
    })
  }

  updateGasUsed = () => {
    this.logInDebug('Start updating gas used!');
    this.getLatestTrades().then((res) => {
      this.allTrades = res.allTradeses // not a typo :)

      _.forEach(this.allTrades, (trade) => {
        this.sleep(300).then(() => {
          this.logInDebug('Getting gas used and price...');
          this.getGasUsedAndPriceForTransaction(trade).then((res) => {
            trade['gasUsed'] = res[0].gasUsed
            trade['gasPrice'] = new BigNumber(res[1].gasPrice).div(10**9).toNumber()
            this.updateTrade(trade).then((res) => {
              this.logInDebug('Updated');
            }).catch((error) => {
              this.logInDebug('Error updating trade', error);
            })
          })
        })
      })
    })
  }

  /*******************************************************
  *    MARKET POLLING
  *********************************************************/

  fetchCCPrices = () => {
    getFiatValue("USD", ["ZRX", "ETH"])
    .then((result) => {
      const zrxPrice = 1 / result.data['USD']['ZRX']
      const ethPrice = 1 / result.data['USD']['ETH']
      this.setInfoItem('zrxPrice', zrxPrice.toString())
      this.setInfoItem('ethPrice', ethPrice.toString())
    })
    .catch((error) => {
      this.logInDebug("Cannot get fiat values", error);
    })
  }

  startPollingForMarketPrices = () => {
    this.fetchCCPrices()
    this.marketInterval = setInterval(() => {
      this.fetchCCPrices()
    }, 3600000) // every hour
  }

  stopPollingForMarketPrices = () => {
    clearInterval(this.marketInterval)
  }

  /*******************************************************
  *    HISTORY CALCULATIONS
  *********************************************************/

  calculateHistory = () => {
    this.fetchHistoryForBucket(this.hBucketStart, this.hBucketStart + this.offset)
  }

  fetchHistoryForBucket = (bucketStart, bucketEnd, singleDay = false) => {
    bucketStart = parseInt(bucketStart)
    bucketEnd = parseInt(bucketEnd)
    if (bucketStart >= this.now) {
      this.logInDebug('Finished fetching history!')
      return
    }
    this.logInDebug('Doing history for ' + moment(bucketStart * 1000).format('DD.MM.YYYY.'));
    let history = {}
    history['timestamp'] = bucketStart

    const bucket = _.filter(this.allTrades, (trade) => {
      return trade.timestamp >= bucketStart && trade.timestamp < bucketEnd
    })

    if (bucket.length === 0) {
      if (typeof bucketStart !== 'number') {
        this.logInDebug('Invalid timestamp ', bucketStart);
        return
      }
      getFiatValue('USD', ['ZRX', 'ETH'], bucketStart)
      .then((result) => {
        // this.logInDebug(result);
        history = {
          timestamp: bucketStart,
          startBlockNumber: null,
          endBlockNumber: null,
          zrxUsdPrice: 1 / result.data['USD']['ZRX'],
          ethUsdPrice: 1 / result.data['USD']['ETH'],
          feesPaidTotal: 0,
          tradeVolumeUsd: 0,
        }
        this.getHistoryIdByTimestamp(history['timestamp'])
        .then((result) => {
          if (result.allHistories.length === 0) {
            this.setHistory(history)
          } else {
            history['id'] = result.allHistories[0].id
            this.updateHistory(history)
          }
        }).catch((error) => {
          this.logInDebug('error getting history ', error);
        })
        if (singleDay) { return }
        this.fetchHistoryForBucket(bucketEnd, bucketEnd + this.offset)
      })
      .catch((error) => {
        this.logInDebug('Error fetching token prices. ', error);
        return
        this.fetchHistoryForBucket(bucketEnd, bucketEnd + this.offset)
      })

    } else {
      const sortedBucket = _.sortBy(bucket, 'timestmap')
      history['startBlockNumber'] = _.first(sortedBucket).blockNumber
      history['endBlockNumber'] = _.last(sortedBucket).blockNumber

      // get zrx fees
      let feesPaidTotal = new BigNumber(0)
      _.forEach(sortedBucket, (trade) => {
        const totalFee = new BigNumber(trade.args.paidMakerFee).add(new BigNumber(trade.args.paidTakerFee))
        feesPaidTotal = feesPaidTotal.add(totalFee)
      })
      history['feesPaidTotal'] = this.bigNumberToNumber(feesPaidTotal, 18) // ZRX big number to ZRX decimals

      // get all the traded tokens
      let tokenVolume = {}
      this.getTokens()
      .then((res) => {
        this.tokens = mapTokenList(res.allTokens)
        // initial
        _.forEach(this.tokens, (token) => { tokenVolume[token.address] = new BigNumber(0) })
        // group by token
        _.forEach(sortedBucket, (trade) => {
          if (this.tokens[trade.args.makerToken]) {
            tokenVolume[trade.args.makerToken] = tokenVolume[trade.args.makerToken].add(new BigNumber(trade.args.filledMakerTokenAmount))
          }
          if (this.tokens[trade.args.takerToken]) {
            tokenVolume[trade.args.takerToken] = tokenVolume[trade.args.takerToken].add(new BigNumber(trade.args.filledTakerTokenAmount))
          }
        })
        // remove those without trade
        const reducedTokenVolume = this.cleanTokensWithNoOrdersFilled(tokenVolume)

        // get market data
        const tokens = this.tokens
        const tokenAddresses = Object.keys(reducedTokenVolume)
        const tokenSymbols = tokenAddresses.map((address) => tokens[address].symbol)
        const loadedTokenSymbols = _.union(tokenSymbols, ['ZRX', 'ETH'])
        this.logInDebug('asking symbols: ', loadedTokenSymbols, ' on timestamp ', bucketStart * 1000);
        getFiatValue('USD', loadedTokenSymbols, bucketStart) // get price at bucketStart timestamp
        .then((res) => {
          if (res.data) {
            this.logInDebug(res.data['USD']);
          }
          let result = {}
          result['USD'] = {}

          if (_.isArray(res)) {
            _.forEach(res, (chunk) => {
              _.assign(result['USD'], chunk.data['USD'])
            })
          } else {
            _.assign(result['USD'], res.data['USD'])
          }

          // place ETH price in WETH place
          result['USD']['WETH'] = result['USD']['ETH']
          history['zrxUsdPrice'] = 1 / result['USD']['ZRX']
          history['ethUsdPrice'] = 1 / result['USD']['ETH']


          let tokenPrices = {}
          _.forEach(tokenAddresses, (address) => {
            const symbol = tokens[address].symbol
            tokenPrices[address] = result['USD'][symbol] ? 1 / result['USD'][symbol] : result['USD'][symbol]
          })

          // marry token prices to volumes
          let tradeVolumeUsd = new BigNumber(0)
          _.forEach(tokenAddresses, (address) => { // array of actually used token addresses
            let tokenSum = tokenPrices[address] ? reducedTokenVolume[address] * tokenPrices[address] : 0
            tokenSum = parseFloat(tokenSum.toFixed(2))
            tradeVolumeUsd = tradeVolumeUsd.add(new BigNumber(tokenSum))
          })
          history['tradeVolumeUsd'] = tradeVolumeUsd.toNumber()

          // now go push it to gql
          this.getHistoryIdByTimestamp(history.timestamp)
          .then((result) => {
            if (result.allHistories.length === 0) {
              this.setHistory(history)
            } else {
              history['id'] = result.allHistories[0].id
              this.updateHistory(history)
            }
          })
          if (singleDay) { return }
          this.fetchHistoryForBucket(bucketEnd, bucketEnd + this.offset)

        })
        .catch((error) => {
          this.logInDebug('Error getting token prices', error);
          return
          this.fetchHistoryForBucket(bucketEnd, bucketEnd + this.offset)

        })
      })
    }
  }

  cleanTokensWithNoOrdersFilled = (tokenVolume) => {
    let result = {}
    _.forEach(this.tokens, (token) => {
      if (!tokenVolume[token.address].isZero()) {
        result[token.address] = this.bigNumberToNumber(tokenVolume[token.address], token.decimals)
      }
    })
    return result
  }

  bigNumberToNumber = (amount, decimals) => {
    return amount.div(10**decimals).toDigits(6).toNumber()
  }

  /*******************************************************
  *    HISTORY FETCHING CHAIN
  *********************************************************/

  historyFetch() {
    this.historyStartDate = '20170817'
    this.hStart = moment(this.historyStartDate).unix()
    this.blockHeight = 4441432

    this.fetchHistoryTrades()
  }

  fetchHistoryTrades = (i = 1) => { // iterator is just a control factor, remove later
    const toBlock = this.lastFetchedBlock || this.blockHeight
    const fromBlock = toBlock - ETH.TRADE_BATCH_BLOCKS
    this.logInDebug(`Fetch # ${i} from ${fromBlock} to ${toBlock}`);
    this.processLogBatch(fromBlock, toBlock, this.hStart)
    .then(({ mappedLogs, overTheLimit}) => {

      _.forEach(mappedLogs, (log) => {
        this.sleep(250)
        .then(() => {
          this.setLatestTrades(log)
          .then((res) => {
            this.logInDebug('Set trade success! ', log.blockNumber)
          })
          .catch((err) => {
            this.logInDebug('setLatestTrades error blockNumber ', log.blockNumber)
          })
        })
      })

      if (!overTheLimit) {
        this.fetchHistoryTrades(i + 1)
      }

    })
    .catch((err) => {
      this.logInDebug("processLogBatch failed", err)
    })
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /*******************************************************
  *    GRAPHQL
  *********************************************************/

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
      $gasUsed: Int,
      $gasPrice: Float,
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
        gasUsed: $gasUsed,
        gasPrice: $gasPrice,
      ) {
        id
        address
        timestamp
        blockNumber
        transactionHash
        transactionIndex
        gasUsed
        gasPrice
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

  updateTrade = (trade) => {
    this.logInDebug('Updating trade with gas used: ', trade.gasPrice);
    const query = `mutation updateTrades(
      $id: ID!,
      $address: String,
      $timestamp: Int,
      $blockNumber: String,
      $transactionHash: String!,
      $transactionIndex: String,
      $gasUsed: Int,
      $gasPrice: Float,
      $blockHash: String,
      $event: String,
      $removed: Boolean,
      $filledMakerTokenAmountNormalized: Float,
      $filledTakerTokenAmountNormalized: Float,
      $price: Float,
      $invertedPrice: Float,
      $args: Json,
    ) {
      updateTrades(
        id: $id,
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
        gasUsed: $gasUsed,
        gasPrice: $gasPrice,
      ) {
        id
      }
    }`
    return this.graphqlClient.request(query, trade)
  }

  setHistory = (history) => {
    this.logInDebug('Setting history!');
    const query = `mutation createHistory(
      $timestamp: Int!,
      $startBlockNumber: String,
      $endBlockNumber: String,
      $zrxUsdPrice: Float,
      $ethUsdPrice: Float,
      $tradeVolumeUsd: Float,
      $feesPaidTotal: Float,
    ) {
      createHistory(
        timestamp: $timestamp,
        startBlockNumber: $startBlockNumber,
        endBlockNumber: $endBlockNumber,
        zrxUsdPrice: $zrxUsdPrice,
        ethUsdPrice: $ethUsdPrice,
        tradeVolumeUsd: $tradeVolumeUsd,
        feesPaidTotal: $feesPaidTotal,
      ) {
        id
      }
    }`
    return this.graphqlClient.request(query, history)
  }

  getHistoryIdByTimestamp = (timestamp) => {
    const query = `
      query getHistoryIdByTimestamp($timestamp: Int!) {
        allHistories( filter: { timestamp: $timestamp }) {
          id
        }
      }
    `
    return this.graphqlClient.request(query, { timestamp: timestamp })
  }

  updateHistory = (history) => {
    this.logInDebug('Updating History! ', history);
    const query = `
      mutation updateHistory(
        $id: ID!,
        $timestamp: Int!,
        $startBlockNumber: String,
        $endBlockNumber: String,
        $zrxUsdPrice: Float,
        $ethUsdPrice: Float,
        $tradeVolumeUsd: Float,
        $feesPaidTotal: Float,
      ) {
        updateHistory(
          id: $id,
          timestamp: $timestamp,
          startBlockNumber: $startBlockNumber,
          endBlockNumber: $endBlockNumber,
          zrxUsdPrice: $zrxUsdPrice,
          ethUsdPrice: $ethUsdPrice,
          tradeVolumeUsd: $tradeVolumeUsd,
          feesPaidTotal: $feesPaidTotal,
        ) {
          id
        }
      }
      `
    return this.graphqlClient.request(query, history)
  }


}
