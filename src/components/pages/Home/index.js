import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { graphql, compose } from 'react-apollo'
import _ from 'lodash'
import moment from 'moment'
import { Button, Grid, Cell, Paper } from 'react-md'

import { TRADE_LIST } from 'src/graphql/trade.graphql'
import { HISTORY_LIST, HISTORY_LIST_LIMITED } from 'src/graphql/history.graphql'
import { Loader, WhitePaper } from 'src/components/common'
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
        {
          reducedTrades
          ? <WhitePaper>
            { history && <HistoryGraphs history={history} /> }
            <Last24HoursStats latestTrades={reducedTrades} />
            <Grid>
              <Link style={{ margin: '0 auto'}} to="/history"><Button secondary flat>See more trades</Button></Link>
            </Grid>
          </WhitePaper>
          : <Loader />
        }
      </div>
    )
  }
}

const latestTradesQuery = graphql(TRADE_LIST, {
  options: { pollInterval: 60000 }, // 1 minute refresh
  props: ({ data: { allTrades }}) => ({
    latestTrades: allTrades,
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
