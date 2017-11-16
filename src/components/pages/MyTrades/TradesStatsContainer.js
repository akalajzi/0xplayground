import React, { Component } from 'react'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'
import { graphql, compose } from 'react-apollo'
import _ from 'lodash'
import PropTypes from 'prop-types'
import {
  Grid,
  Cell,
  Paper,
} from 'react-md'

import { getFiatValue } from 'src/util/marketApi'

import { TradesTable, CellTitle, CellTitleDescription, Loader } from 'src/components/common'
import DailyTokenVolumeCard from './../Home/DailyTokenVolumeCard' // TODO: move this
import DailyFeesCard from './../Home/DailyFeesCard'
import WalletActivity from './WalletActivity'

import { MY_TRADE_LIST } from 'src/graphql/trade.graphql'

import { connectZeroEx } from 'src/components/blockchain/helper'
import Web3 from 'web3'
import INFURA from 'src/const/infura'


import CURRENCIES from 'src/const/currencies'

class TradesStatsContainer extends Component {
  static propTypes = {
    address: PropTypes.string,
    trades: PropTypes.array,
    tokens: PropTypes.object,
    relayers: PropTypes.array,
  }

  constructor(props) {
    super(props)

    this.zeroEx = connectZeroEx(INFURA.MAINNET)
    this.web3 = new Web3(new Web3.providers.HttpProvider(INFURA.MAINNET))

    this.state = {
      collectedFees: null,
      tokenPrices: null,
      tokenBalances: null,
    }
  }

  componentDidMount() {
    // this.fetchTokenBalances()
  }

  componentDidUpdate(prevProps) {
    if (this.props.trades && this.props.tokens && !this.state.collectedFees) {
      const collectedFees = this.calculateCollectedFees()
      this.setState({ collectedFees })
    }

    if (this.props.trades !== prevProps.trades) { // happens when changing address
      const collectedFees = this.calculateCollectedFees()
      this.setState({ collectedFees })
      // this.fetchTokenBalances()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.collectedFees && !this.state.tokenPrices) {
      this.fetchTokenPrices(this.state.collectedFees.tokenVolume)
    }
  }

  bigNumberToNumber = (amount, decimals) => {
    return amount.div(10**decimals).toDigits(6).toNumber()
  }

  cleanTokensWithNoOrdersFilled = (tokenVolume) => {
    let result = {}
    _.forEach(this.props.tokens, (token) => {
      if (!tokenVolume[token.address].isZero()) {
        result[token.address] = this.bigNumberToNumber(tokenVolume[token.address], token.decimals)
      }
    })
    return result
  }

  calculateCollectedFees = () => {
    const { trades, relayers, tokens, address } = this.props
    const zrxDecimals = 18

    let sum = new BigNumber(0)
    let side = ''
    let feeRecipients = {}
    let tokenVolume = {}
    // prepare objects
    _.forEach(relayers, (relay) => { feeRecipients[relay.address] = new BigNumber(0) })
    _.forEach(tokens, (token) => { tokenVolume[token.address] = new BigNumber(0) })

    // loop through trades
    _.forEach(trades, (trade) => {
      // total fees
      const totalFee = trade.maker === address ? new BigNumber(trade.paidMakerFee) : new BigNumber(trade.paidTakerFee)
      sum = sum.add(totalFee)
      // recipient
      if (feeRecipients[trade.feeRecipient]) {
        feeRecipients[trade.feeRecipient] = feeRecipients[trade.feeRecipient].add(totalFee)
      } else {
        console.log('Unknown fee recipient', trade.feeRecipient)
      }

      // token volume groupings
      if (tokens[trade.makerToken]) {
        tokenVolume[trade.makerToken] = tokenVolume[trade.makerToken].add(new BigNumber(trade.filledMakerTokenAmount))
      }
      if (tokens[trade.takerToken]) {
        tokenVolume[trade.takerToken] = tokenVolume[trade.takerToken].add(new BigNumber(trade.filledTakerTokenAmount))
      }
    })
    const reducedTokenVolume = this.cleanTokensWithNoOrdersFilled(tokenVolume)

    return {
      total: this.bigNumberToNumber(sum, zrxDecimals),
      feeRecipients,
      tokenVolume: reducedTokenVolume,
    }
  }

  sortTrades = (trades) => {
    return _.sortBy(trades, 'timestamp').reverse()
  }

  fetchTokenBalances = () => {
    const { tokens, address } = this.props
    const isAddress = this.web3.utils.isAddress
    const sortedTokens = _.sortBy(tokens, 'address')
    const tokenBalances = {}

    let batch = []
    _.forEach(sortedTokens, (token, iterator) => {
      if (isAddress(token.address.toLowerCase()) && isAddress(address.toLowerCase())) {
        batch.push(this.zeroEx.token.getBalanceAsync(token.address.toLowerCase(), address.toLowerCase()))
      } else {
        batch.push(null) // just to keep iterator order
      }
    })

    Promise.all(batch).then((results) => {
      _.forEach(sortedTokens, (token, i) => {
        if (results[i] && !results[i].isZero()) {
          tokenBalances[token.address] = {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            amount: this.bigNumberToNumber(results[i], token.decimals)
          }
        }
      })
    })
    this.setState({ tokenBalances })
  }

  fetchTokenPrices = (tokenVolume) => {
    const { tokens, market } = this.props
    const tokenAddresses = Object.keys(tokenVolume)
    const tokenSymbols = tokenAddresses.map((address) => tokens[address].symbol)
    getFiatValue(market.currency, tokenSymbols)
    .then((res) => {
      const result = {}
      result[market.currency] = {}

      if (_.isArray(res)) {
        _.forEach(res, (chunk) => {
          _.assign(result[market.currency], chunk.data[market.currency])
        })
      } else {
        _.assign(result[market.currency], res.data[market.currency])
      }

      // place ETH price in WETH place
      result[market.currency]['WETH'] = result[market.currency]['ETH']
      let tokenPrices = {}
      _.forEach(tokenAddresses, (address) => {
        const symbol = tokens[address].symbol
        tokenPrices[address] = result[market.currency][symbol] ? 1 / result[market.currency][symbol] : result[market.currency][symbol]
      })
      this.setState({ tokenPrices })
    })
  }

  render() {
    const { relayers, tokens, trades, market, address } = this.props
    const { collectedFees, tokenPrices } = this.state

    if (!trades) {
      return <Loader />
    }

    return(
        <Grid>
            {/* <Cell size={6}>
              <CellTitle title='Wallet balance' />
              <WalletActivity tokenBalances={this.state.tokenBalances} />
            </Cell> */}
            {/* <Cell size={6}>asdf</Cell> */}
            <Cell size={6}>
              <CellTitle title='Trading volume' />
              <CellTitleDescription text='* Includes value of both sides of the trade' />
              <DailyTokenVolumeCard
                collectedFees={collectedFees}
                fiat={CURRENCIES[market.currency]}
                tokenPrices={tokenPrices}
                tokens={tokens}
              />
            </Cell>
            <Cell size={6}>
              <CellTitle title='Fees paid' />
              <CellTitleDescription text='* Fees you paid to relayers' />
              <DailyFeesCard
                collectedFees={collectedFees}
                zrxPrice={market.zrxPrice}
                fiat={CURRENCIES[market.currency]}
                relayers={relayers}
              />
            </Cell>
            <Cell size={12} align='stretch'>
              <CellTitle title='List of trades' />
              <TradesTable
                relayers={relayers}
                tokens={tokens}
                latestTrades={trades}
              />
            </Cell>
        </Grid>
    )
  }
}

const myTradesQuery = graphql(MY_TRADE_LIST, {
  options: (props) => ({
    pollInterval: 60000, // 1 minute refresh
    variables: {
      address: props.address,
    }
  }),
  props: ({ data: { allTrades }}) => ({
    trades: allTrades,
  })
})

export default compose(
  myTradesQuery,
  connect((state) => {
    return {
      market: state.market,
    }
  })
)(TradesStatsContainer)
