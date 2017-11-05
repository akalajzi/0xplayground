import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import Web3 from 'web3'
import _ from 'lodash'

import { connectZeroEx } from './helper'
import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'
import { getFiatValue } from 'src/util/marketApi'
import {
  setMarketValues,
  setZrxPrice,
  setEthPrice,
  setError as setMarketError
} from 'src/reducers/market'

import {
  setBlockHeight,
  setNetwork,
} from 'src/reducers/network'

class Blockchain extends Component {
  constructor(props) {
    super(props)

    this.zeroEx = connectZeroEx(INFURA.MAINNET)
    // use web3 from ZeroEx
    this.web3 = this.zeroEx._web3Wrapper.web3
    this.web3Sync = new Web3(new Web3.providers.HttpProvider(INFURA.MAINNET))

    this.state = {
      mvInterval: null,
    }
  }

  componentDidMount() {
    this.fetchNetworkId(this.web3)
    this.fetchBlockHeight()
    this.pollForMarketValue()
  }

  componentWillUnmount() {
    clearInterval(this.state.mvInterval)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.blockchainInfo && nextProps.blockchainInfo) {
      const zrxPrice = _.find(nextProps.blockchainInfo, item => item.name === 'zrxPrice' ).value
      const ethPrice = _.find(nextProps.blockchainInfo, item => item.name === 'ethPrice' ).value
      this.props.setZrxPrice(zrxPrice)
      this.props.setEthPrice(ethPrice)
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

  pollForMarketValue = () => {
    this.fetchMarketValue()
    const mvInterval = setInterval(() => {
      this.fetchMarketValue()
    }, 10000)
    this.setState({ mvInterval })
  }

  fetchMarketValue = () => {
    getFiatValue(this.props.market.currency, ['ZRX', 'ETH', 'BTC'])
    .then((res) => {
      this.props.setMarketValues(res.data)
    })
    .catch((error) => {
      this.props.setMarketError(error)
    })
  }

  render() {
    return null
  }

}

const blockchainInfoList = graphql(
  gql`
    query BlockchainInfo {
      allBlockchainInfoes {
        id
        name
        value
      }
    }
  `, {
    props: ({ data: { allBlockchainInfoes }}) => ({
      blockchainInfo: allBlockchainInfoes,
    }),
  }
)

export default compose(
  blockchainInfoList,
  connect((state) => {
    return {
      network: state.network,
      market: state.market,
    }
  }, (dispatch) => {
    return bindActionCreators({
      setBlockHeight,
      setNetwork,
      setMarketValues,
      setZrxPrice,
      setEthPrice,
      setMarketError,
    }, dispatch)
  })
)(Blockchain)
