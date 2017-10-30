import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { graphql, compose } from 'react-apollo'
import _ from 'lodash'
import moment from 'moment'
import { Button, Grid, Cell, Paper } from 'react-md'

import { TRADES_LIST } from 'src/graphql/trades.graphql'
import { HISTORY_LIST, HISTORY_LIST_LIMITED } from 'src/graphql/history.graphql'
import { Wallet, Loader } from 'src/components/common'
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
        {
          reducedTrades
          ? <Paper style={{background: '#ffffff', paddingBottom: '20px'}}>
            { history && <HistoryGraphs history={history} /> }
            <Last24HoursStats latestTrades={reducedTrades} />
            <Grid>
              <Link style={{ margin: '0 auto'}} to="/history"><Button secondary flat>See more trades</Button></Link>
            </Grid>
          </Paper>
          : <Loader />
        }
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

const historyQuery = graphql(HISTORY_LIST_LIMITED, {
  props: ({ data: { allHistories }}) => ({
    history: allHistories,
  })
})

export default compose(
  latestTradesQuery,
  historyQuery,
)(Home)
