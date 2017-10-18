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
    if (!this.props.networkId && nextProps.networkId) {
      this.getWeb3Provider()
    }
  }

  getWeb3Provider = () => {
    if (typeof window.web3 !== undefined && this.state.web3 === null) {
      // this.web3 = window.web3
      this.setState({ web3: window.web3 })
    }
  }

  getActiveAccount = (web3, activeAccount) => {
    if (!web3) { return null }

    web3.eth.getAccounts((err, res) => {
      const newActiveAccount = err ? null : res[0]
      if (newActiveAccount !== activeAccount) {
        this.props.setActiveAccount(newActiveAccount)
      }
    })
  }

  pollForActiveAccount = () => {
    setInterval(() => {
      this.getWeb3Provider()
      this.getActiveAccount(this.state.web3, this.props.wallet.activeAccount)
      this.getInjectedNetwork(this.state.web3)
    }, 120)
  }

  getInjectedNetwork = (web3) => {
    if (!web3) { return null }

    web3.version.getNetwork((err, netId) => {
      if (!err && netId !== this.props.networkId) {
        this.props.setNetwork(netId)
      }
    })
  }

  render() {
    const { networkId, activeAccount } = this.props
    if (!this.state.web3) {
      return <div className="Wallet">Wallet not connected.</div>
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
    networkId: state.network.id,
    wallet: state.wallet,
  }
}, (dispatch) => {
  return bindActionCreators({
    setActiveAccount,
    setNetwork,
  }, dispatch)
})(Wallet)
