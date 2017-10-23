import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { graphql, compose } from 'react-apollo'

import Web3 from 'web3'

import { connectZeroEx, mapTokenList, mapLogs } from './helper'
import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'

import {
  setBlockHeight,
  setContractAddress,
  addLog,
  setLogs,
  setNetwork,
  setTimestampOnTrade,
  setTokens,
  setZrxContractAddress,
} from 'src/reducers/network'

class Blockchain extends Component {
  constructor(props) {
    super(props)

    this.zeroEx = connectZeroEx(INFURA.MAINNET)
    // use web3 from ZeroEx
    this.web3 = this.zeroEx._web3Wrapper.web3
  }

  componentDidMount() {
    this.fetchNetwork(this.web3)
    this.fetchZrxTokenAddress()
    this.fetchBlockHeight()
    if (this.props.fetchPastTrades) {
      this.fetchTrades()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.tokens && nextProps.tokens) {
      this.props.setTokens(nextProps.tokens)
    }
  }

  fetchNetwork = (web3) => {
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

  fetchZrxTokenAddress = () => {
    this.zeroEx.exchange.getZRXTokenAddressAsync()
      .then((res) => {
        this.props.setZrxContractAddress(res)
      })
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

  fetchTrades = () => {
    this.zeroEx.exchange.getContractAddressAsync()
      .then((address) => {
        this.props.setContractAddress(address)
      })
      .then(() => {
        this.zeroEx.exchange.subscribeAsync("LogFill", {}, this.handleLogFillEvent.bind(this, null))
        return this.fetchPastTrades(ETH.TRADE_BATCH_BLOCKS)
      })
      .then(() => {
        // initial fetch done
        // update stats
      })
  }

  handleLogFillEvent = (err, res) => {
    console.log('handle log fill event');
    if (err) {
      console.log('LogFill error', err);
    } else {
      console.log('got a trade! ', res);
      const mappedLog = mapLogs(res, this.props.tokens, this.web3)
      console.log('mapped new trade: ', mappedLog);
      this.props.addLog(mappedLog)
      this.mapLogsWithTimestamp(mappedLog)
    }
  }

  fetchPastTrades = (blockCount) => {
    //TODO: temp fix
    blockCount = 4000
    const toBlock = this.getLastFetchedBlock()
    const fromBlock = toBlock - blockCount

    this.zeroEx.exchange.getLogsAsync("LogFill", { fromBlock, toBlock }, {})
    .then((logs) => {
      const mappedLogs = mapLogs(logs, this.props.tokens, this.web3)
      this.props.setLogs({logs: mappedLogs, fromBlock})
      this.mapLogsWithTimestamp(mappedLogs)
    })
  }

  mapLogsWithTimestamp = (logs) => {
    for (let key in logs) {
      if (logs.hasOwnProperty(key)) {
        const trade = logs[key]
        const blockNumber = this.web3.toDecimal(trade.blockNumber)
        this.web3.eth.getBlock(blockNumber, (err, res) => {
          const timestamp = res.timestamp
          const timestampedTrade = {...trade, timestamp }
          this.props.setTimestampOnTrade({blockNumber, timestampedTrade}) // this is fine, batch requests do not make querying faster
        })
      }
    }
  }

  getLastFetchedBlock = () => {
    const { network } = this.props
    if (network.lastFetchedBlock) {
      return network.lastFetchedBlock
    } else {
      return network.blockHeight
    }
  }

  render() {
    // console.log("window web3 provider ", window.web3);
    // console.log("zeroEx ", this.zeroEx);
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
      setContractAddress,
      addLog,
      setLogs,
      setNetwork,
      setTimestampOnTrade,
      setTokens,
      setZrxContractAddress,
    }, dispatch)
  })
)(Blockchain)
