import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'

import { TradesTable } from 'src/components/common'
import { MY_TRADE_LIST } from 'src/graphql/trade.graphql'

class MyTradesTable extends Component {
  render() {
    const { trades, relayers, tokens, wallet } = this.props

    return(
      <TradesTable
        relayers={relayers}
        tokens={tokens}
        latestTrades={trades}
      />
    )
  }
}

const myTradesQuery = graphql(MY_TRADE_LIST, {
  options: (props) => ({
    pollInterval: 60000, // 1 minute refresh
    variables: {
      address: props.wallet ? props.wallet.activeAccount : null,
    }
  }),
  props: ({ data: { allTrades }}) => ({
    trades: allTrades,
  })
})

export default compose(
  myTradesQuery,
)(MyTradesTable)
