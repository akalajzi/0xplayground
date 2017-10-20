import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ETH from 'src/const/eth'
import { setActiveAccount, setNetwork } from 'src/reducers/wallet'

class Wallet extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
    }
  }

  componentDidMount() {
    this.pollForActiveAccount()
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.zrxNetworkId && nextProps.zrxNetworkId) {
      this.getWeb3Provider()
    }
  }

  getWeb3Provider = () => {
    if (typeof window.web3 !== undefined && this.state.web3 === null) {
      // this.web3 = window.web3
      this.setState({ web3: window.web3 })
    }
  }

  getActiveAccount = () => {
    const web3 = this.state.web3
    const activeAccount = this.props.wallet.activeAccount
    if (!web3) { return null }

    web3.eth.getAccounts((err, res) => {
      const newActiveAccount = err ? null : res[0]
      if (newActiveAccount !== activeAccount) {
        this.props.setActiveAccount(newActiveAccount)
      }
    })
  }

  getInjectedNetwork = () => {
    const web3 = this.state.web3
    if (!web3) { return null }

    web3.version.getNetwork((err, netId) => {
      if (!err && (netId !== this.props.wallet.networkId)) {
        this.props.setNetwork(netId)
      }
    })
  }

  pollForActiveAccount = () => {
    setInterval(() => {
      this.getWeb3Provider()
      this.getActiveAccount()
      this.getInjectedNetwork()
    }, 350)
  }

  render() {
    const { networkId, activeAccount } = this.props.wallet
    if (!this.state.web3) {
      return <div className="Wallet">Web3 not found. Get MetaMask!</div>
    } else if (!activeAccount) {
      return <div className="Wallet">Wallet not reachable. Are you logged in to your wallet?</div>
    }

    return(
      <div className="Wallet">
        <div>Connected Network: { ETH.NETWORK_NAME[networkId] }</div>
        <div>Connected Account: { activeAccount }</div>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    zrxNetworkId: state.network.id,
    wallet: state.wallet,
  }
}, (dispatch) => {
  return bindActionCreators({
    setActiveAccount,
    setNetwork,
  }, dispatch)
})(Wallet)
