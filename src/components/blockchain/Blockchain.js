import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Web3 from 'web3'
import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'

import { mapTokenList } from './helper'
import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'
import {
  setBlockHeight,
  setContractAddress,
  setLogs,
  setNetwork,
  setTokens
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
      this.props.setLogs({logs, fromBlock})
    })
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
    console.log("window web3 provider ", window.web3);
    console.log("zeroEx ", this.zeroEx);
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
    setTokens,
  }, dispatch)
})(Blockchain)
