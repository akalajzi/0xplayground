import React, { PureComponent } from 'react'
import { graphql, compose } from 'react-apollo'

import { Grid, Cell } from 'react-md'

import { mapTokenList } from 'src/components/blockchain/helper'
import { CellTitle, TradesTable } from 'src/components/common'
import { TRADE_LIST } from 'src/graphql/trade.graphql'
import { RELAY_LIST } from 'src/graphql/relay.graphql'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'

class History extends PureComponent {
  sortTrades = (trades) => {
    return _.sortBy(trades, 'timestamp').reverse()
  }

  render() {
    const { relayers, tokens, allTrades } = this.props

    return (
      <div className="history">
        <Grid>
          <Cell align='stretch' size={12}>
            <CellTitle title='Trade History' />
            <TradesTable
              relayers={relayers}
              tokens={tokens}
              latestTrades={this.sortTrades(allTrades)}
            />
          </Cell>
        </Grid>
      </div>
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

const latestTradesQuery = graphql(TRADE_LIST, {
  options: { pollInterval: 60000 }, // 1 minute refresh
  props: ({ data: { allTrades }}) => ({
    allTrades: allTrades,
  })
})

export default compose(
  relayListQuery,
  tokenListQuery,
  latestTradesQuery,
)(History)
