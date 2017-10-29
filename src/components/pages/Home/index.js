import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import _ from 'lodash'
import moment from 'moment'
import { Grid, Cell, Paper } from 'react-md'

import { TRADES_LIST } from 'src/graphql/trades.graphql'
import { HISTORY_LIST } from 'src/graphql/history.graphql'
import { Wallet } from 'src/components/common'
import Last24HoursStats from './Last24HoursStats'
import HistoryGraphs from './HistoryGraphs'

class Home extends Component {
  reduceTo24Hours = (trades) => {
    const now = moment().utc()
    const startTime = now.subtract(24, 'hours').unix()

    return _.filter(trades, (trade) => {
      return trade.timestamp >= startTime
    })
  }

  render() {
    const { latestTrades, history } = this.props
    const reducedTrades = latestTrades ? this.reduceTo24Hours(latestTrades) : null

    return(
      <div className="home">
        <Grid>
          <Wallet />
        </Grid>
        <Paper style={{background: '#ffffff'}}>
          { history && <HistoryGraphs history={history} /> }
          <Last24HoursStats latestTrades={reducedTrades} />
        </Paper>
      </div>
    )
  }
}

const latestTradesQuery = graphql(TRADES_LIST, {
  options: { pollInterval: 60000 }, // 1 minute refresh
  props: ({ data: { allTradeses }}) => ({
    latestTrades: allTradeses,
  })
})

const historyQuery = graphql(HISTORY_LIST, {
  props: ({ data: { allHistories }}) => ({
    history: allHistories,
  })
})

export default compose(
  latestTradesQuery,
  historyQuery,
)(Home)
