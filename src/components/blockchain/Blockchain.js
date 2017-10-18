import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Web3 from 'web3'
import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'

import { mapTokenList, mapLogs } from './helper'
import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'
import {
  setBlockHeight,
  setContractAddress,
  setLogs,
  setNetwork,
  setTimestampOnTrade,
  setTokens,
  setZrxContractAddress,
} from 'src/reducers/network'

class Blockchain extends Component {
  constructor(props) {
    super(props)

    this.zeroEx = this.connectZeroEx(INFURA.MAINNET)
    // use web3 from ZeroEx
    this.web3 = this.zeroEx._web3Wrapper.web3
  }

  componentDidMount() {
    // let web3 = window.web3
    // if (typeof web3 !== undefined) {
    //   console.log('not undefined => ', web3);
    //   window.web3 = new Web3(web3.currentProvider)
    // } else {
    //   console.log('not injected yet...');
    //   web3 = new Web3()
    //   web3.setProvider(new web3.providers.HttpProvider(INFURA.KOVAN))
    //   window.web3 = web3
    // }
    // this.fetchNetwork(web3)
    this.fetchNetwork(this.web3)
    this.fetchZrxTokenAddress()
    this.fetchBlockHeight()
    this.fetchTokens()
  }

  connectZeroEx = (network) => {
    const providerEngine = new ProviderEngine()
    providerEngine.addProvider(new FilterSubprovider())
    providerEngine.addProvider(new RpcSubprovider({rpcUrl: network}))
    providerEngine.start()
    return new ZeroEx(providerEngine)
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

  fetchTokens = () => {
    this.zeroEx.exchange.getContractAddressAsync()
      .then((address) => {
        this.props.setContractAddress(address)
        return this.zeroEx.tokenRegistry.getTokensAsync()
      })
      .then((tokens) => {
        this.props.setTokens(mapTokenList(tokens))
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
    }
  }

  fetchPastTrades = (blockCount) => {
    const toBlock = this.getLastFetchedBlock()
    const fromBlock = toBlock - blockCount

    this.zeroEx.exchange.getLogsAsync("LogFill", { fromBlock, toBlock }, {})
    .then((logs) => {
      const mappedLogs = mapLogs(logs, this.props.network.tokens, this.web3)
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

export default connect((state) => {
  return {
    network: state.network
  }
}, (dispatch) => {
  return bindActionCreators({
    setBlockHeight,
    setContractAddress,
    setLogs,
    setNetwork,
    setTimestampOnTrade,
    setTokens,
    setZrxContractAddress,
  }, dispatch)
})(Blockchain)
