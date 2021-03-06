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

import { mapTokenList } from 'src/components/blockchain/helper'
import { RELAY_LIST } from 'src/graphql/relay.graphql'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'

import { getFiatValue } from 'src/util/marketApi'

import { TradesTable, CellTitle, Loader } from 'src/components/common'
import DailyTokenVolumeCard from './DailyTokenVolumeCard'
import DailyFeesCard from './DailyFeesCard'

import CURRENCIES from 'src/const/currencies'

class Last24HoursStats extends Component {
  static propTypes = {
    latestTrades: PropTypes.array,
    tokens: PropTypes.object,
    relayers: PropTypes.array,
  }

  constructor(props) {
    super(props)

    this.state = {
      collectedFees: null,
      tokenPrices: null,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.latestTrades && this.props.tokens && !this.state.collectedFees) {
      const collectedFees = this.calculateCollectedFees()
      this.setState({ collectedFees })
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
    const { latestTrades, relayers, tokens } = this.props
    const zrxDecimals = 18

    let sum = new BigNumber(0)
    let feeRecipients = {}
    let tokenVolume = {}
    // prepare objects
    _.forEach(relayers, (relay) => { feeRecipients[relay.address] = new BigNumber(0) })
    _.forEach(tokens, (token) => { tokenVolume[token.address] = new BigNumber(0) })

    // loop through trades
    _.forEach(latestTrades, (trade) => {
      // total fees
      const totalFee = new BigNumber(trade.paidMakerFee).add(new BigNumber(trade.paidTakerFee))
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
    const { relayers, tokens, latestTrades, market } = this.props
    const { collectedFees, tokenPrices } = this.state

    if (!latestTrades) {
      return <Loader />
    }

    return(
        <Grid>
          <Cell size={6}>
            <CellTitle title='24h Token Volume' />
            <DailyTokenVolumeCard
              collectedFees={collectedFees}
              fiat={CURRENCIES[market.currency]}
              tokenPrices={tokenPrices}
              tokens={tokens}
            />
          </Cell>
          <Cell size={6}>
            <CellTitle title='24h Fees Collected' />
            <DailyFeesCard
              collectedFees={collectedFees}
              zrxPrice={market.zrxPrice}
              fiat={CURRENCIES[market.currency]}
              relayers={relayers}
            />
          </Cell>
          <Cell size={12} align='stretch'>
            <CellTitle title='Trades done in the last 24 hours' />
            <TradesTable
              relayers={relayers}
              tokens={tokens}
              latestTrades={this.sortTrades(latestTrades)}
            />
          </Cell>
        </Grid>
    )
  }
}

const tokenListQuery = graphql(TOKEN_LIST_QUERY, {
  props: ({ data: {allTokens} }) => ({
    tokens: mapTokenList(allTokens)
  }),
})

const relayListQuery = graphql(RELAY_LIST, {
  props: ({ data: {allRelays} }) => ({
    relayers: allRelays
  }),
})

export default compose(
  relayListQuery,
  tokenListQuery,
  connect((state) => {
    return {
      market: state.market,
    }
  })
)(Last24HoursStats)
