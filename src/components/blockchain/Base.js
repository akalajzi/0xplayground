import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import _ from 'lodash'

import { getFiatValue } from 'src/util/marketApi'
import {
  setMarketValues,
  setZrxPrice,
  setEthPrice,
  setError as setMarketError
} from 'src/reducers/market'
import {
  setNetwork,
} from 'src/reducers/network'

class Base extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mvInterval: null,
    }
  }

  componentDidMount() {
    this.pollForMarketValue()

    if (this.props.blockchainInfo) {
      const networkId = _.find(this.props.blockchainInfo, item => item.name === 'networkId' ).value
      this.props.setNetwork(networkId)
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.mvInterval)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.blockchainInfo && nextProps.blockchainInfo) {
      const zrxPrice = _.find(nextProps.blockchainInfo, item => item.name === 'zrxPrice' ).value
      const ethPrice = _.find(nextProps.blockchainInfo, item => item.name === 'ethPrice' ).value
      const networkId = _.find(nextProps.blockchainInfo, item => item.name === 'networkId' ).value
      this.props.setZrxPrice(zrxPrice)
      this.props.setEthPrice(ethPrice)
      this.props.setNetwork(networkId)
    }
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
      setNetwork,
      setMarketValues,
      setZrxPrice,
      setEthPrice,
      setMarketError,
    }, dispatch)
  })
)(Base)
