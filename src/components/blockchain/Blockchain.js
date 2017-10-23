import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { graphql, compose } from 'react-apollo'
import Web3 from 'web3'
import moment from 'moment'

import { connectZeroEx, mapTokenList, mapLog } from './helper'
import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'

import {
  setBlockHeight,
  // setContractAddress,
  setLatestTrades,
  addLog,
  setLogs,
  setNetwork,
  setTimestampOnTrade,
  setTokens,
  // setZrxContractAddress,
} from 'src/reducers/network'

class Blockchain extends Component {
  constructor(props) {
    super(props)

    this.zeroEx = connectZeroEx(INFURA.MAINNET)
    // use web3 from ZeroEx
    this.web3 = this.zeroEx._web3Wrapper.web3
    this.web3Sync = new Web3(new Web3.providers.HttpProvider(INFURA.MAINNET))

    this.state = {
      lastFetchedBlock: null,
    }
  }

  componentDidMount() {
    this.fetchNetworkId(this.web3)
    this.fetchBlockHeight()
  }

  componentDidUpdate(prevProps) {
    // in case we mounted before blockheight was fetched
    if (!prevProps.network.blockHeight && this.props.network.blockHeight) {
      if (this.props.fetchPastTrades) {
        this.fetch24hTrades()
      }
    }
  }

  fetchNetworkId = (web3) => {
    if (web3.version) {
      web3.version.getNetwork((err, res) => {
        if (err) {
          console.log('Error fetching network version ', err);
        } else {
          this.props.setNetwork(res)
        }
      })
    }
  }

  fetchBlockHeight = () => {
    this.web3.eth.getBlockNumber((err, res) => {
      if (err) {
        console.log('Error getting block number ', err);
      } else {
        this.props.setBlockHeight(res)
      }
    })
  }

  fetch24hTrades = (dailylogs = [], i = 1) => { // iterator is just a control factor, remove later
    const now = moment().utc()
    const startTime = now.subtract(24, 'hours').unix()
    // console.log('startTime ', moment(startTime*1000).format('DD.MM.YYYY - HH:mm:ss'));
    // subscribe for ongoing trades
    this.zeroEx.exchange.subscribeAsync("LogFill", {}, this.handleLogFillEvent.bind(this, null))

    const toBlock = this.state.lastFetchedBlock || this.props.network.blockHeight
    const fromBlock = toBlock - ETH.TRADE_BATCH_BLOCKS

    this.processLogBatch(fromBlock, toBlock, startTime)
    .then(({ mappedLogs, overTheLimit}) => {
      const collectedLogs = dailylogs.concat(mappedLogs)
      if (!overTheLimit) {
        this.fetch24hTrades(collectedLogs, i + 1)
      } else {
        // console.log('24 HOURS LOGGED: ', collectedLogs);
        this.props.setLatestTrades(collectedLogs)
      }
    })
  }

  processLogBatch = (fromBlock, toBlock, startTime) => {
    return new Promise ( resolve =>
      this.zeroEx.exchange.getLogsAsync("LogFill", { fromBlock, toBlock }, {})
      .then((logs) => {
        let mappedLogs = []
        let overTheLimit = false
        this.setState({ lastFetchedBlock: fromBlock })

        if (logs.length === 0) {
          resolve({mappedLogs, overTheLimit: false})
          return
        }

        this.getTimestampsForBatch(logs)
        .then((result) => {
          _.forEach(logs, (log, i) => {
            const matchedBlock = _.find(result, (block) => block.hash === log.blockHash)
            // console.log('TRYING TIME: ', moment(matchedBlock.timestamp*1000).format('DD.MM.YYYY - HH:mm:ss'));
            if (matchedBlock.timestamp >= startTime) {
              log['timestamp'] = matchedBlock.timestamp
              mappedLogs.push(mapLog(log, this.props.tokens))
            } else {
              // console.log('GOT OVER THE LIMIT', moment(matchedBlock.timestamp*1000).format('DD.MM.YYYY - HH:mm:ss') );
              overTheLimit = true
            }
          })
          resolve({mappedLogs, overTheLimit})
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
    console.log('got new trade! ', log.transactionHash);
    const currentBlock = this.web3.toDecimal(log.blockNumber)
    console.log('new trade block decimal: ', currentBlock);
    this.web3Sync.eth.getBlock(currentBlock)
    .then((block) => {
      console.log('got block ', block);
      log['timestamp'] = block.timestamp
      const mappedLog = mapLog(log, this.props.tokens)
      this.props.setLatestTrades(mappedLog)
    })
  }

  render() {
    return null
  }

}

const tokenListQuery = graphql(TOKEN_LIST_QUERY, {
  props: ({ data: {allTokens} }) => ({
    tokens: mapTokenList(allTokens)
  }),
})

export default compose(
  tokenListQuery,
  connect((state) => {
    return {
      network: state.network
    }
  }, (dispatch) => {
    return bindActionCreators({
      setBlockHeight,
      // setContractAddress,
      setLatestTrades,
      addLog,
      setLogs,
      setNetwork,
      setTimestampOnTrade,
      setTokens,
      // setZrxContractAddress,
    }, dispatch)
  })
)(Blockchain)
