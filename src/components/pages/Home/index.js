import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import _ from 'lodash'
import moment from 'moment'
import { Grid, Cell } from 'react-md'

import { TRADES_LIST } from 'src/graphql/trades.graphql'
import Wallet from 'src/components/common/Wallet'
import Last24HoursStats from './Last24HoursStats'

class Home extends Component {
  reduceTo24Hours = (trades) => {
    const now = moment().utc()
    const startTime = now.subtract(24, 'hours').unix()

    return _.filter(trades, (trade) => {
      return trade.timestamp >= startTime
    })
  }

  render() {
    const { latestTrades } = this.props
    const reducedTrades = latestTrades ? this.reduceTo24Hours(latestTrades) : null

    return(
      <div className="home">
        <Grid>
          <Wallet />
        </Grid>
        <Grid>
          <Cell align='stretch' size={12}>
            <Last24HoursStats
              latestTrades={reducedTrades}
            />
          </Cell>
        </Grid>
      </div>
    )
  }
}

const latestTradesQuery = graphql(TRADES_LIST, {
  props: ({ data: { allTradeses }}) => ({
    latestTrades: allTradeses,
  })
})

export default compose(
  latestTradesQuery,
)(Home)
