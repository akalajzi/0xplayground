import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Web3 from 'web3'
import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'

import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'
import { setNetwork, setTokens } from 'src/reducers/network'

class Blockchain extends Component {
  constructor(props) {
    super(props)

    this.zeroEx = this.connectZeroEx(INFURA.MAINNET)
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
    // this.getNetwork(web3)
    this.getNetwork(this.zeroEx._web3Wrapper.web3)
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

  fetchTokens = () => {
    this.zeroEx.exchange.getContractAddressAsync()
      .then((address) => {
        console.log('contract address: ', address);
        return this.zeroEx.tokenRegistry.getTokensAsync()
      })
      .then((tokens) => {
        this.props.setTokens(tokens)
      })
      .then(() => {
        this.zeroEx.exchange.subscribeAsync("LogFill", {}, this.handleLogFillEvent.bind(this, null))
        this.fetchPastTrades()
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

  fetchPastTrades = () => {
    this.zeroEx.exchange.getLogsAsync("LogFill", {fromBlock: 4360002, toBlock: 4369412}, {})
    .then((logs) => {
      console.log("past logs: ", logs);
    })
  }

  getNetwork = (web3) => {
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
    const web3 = this.zeroEx._web3Wrapper.web3
    web3.eth.getBlockNumber((err, res) => {
      if (err) {
        console.log('Error getting block number ', err);
      } else {
        console.log('Block height: ', res);
      }
    })
  }

  render() {
    console.log("window web provider ", window.web3);
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
    setNetwork,
    setTokens,
  }, dispatch)
})(Blockchain)
