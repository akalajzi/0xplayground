import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import BigNumber from 'bignumber.js'

import PropTypes from 'prop-types'
import {
  Card,
  CardTitle,
  CardText,
} from 'react-md'

import TradesTable from 'src/components/common/TradesTable'

class Last24HoursStats extends Component {

  calculateTotalFees = () => {
    const trades = this.props.latestTrades
    const zrxDecimals = 18
    let sum = new BigNumber(0)
    _.forEach(trades, (trade) => {
      const totalFee = trade.args.paidMakerFee.add(trade.args.paidTakerFee)
      sum = sum.add(totalFee)
    })
    return new BigNumber(sum.div(10**zrxDecimals)).toDigits(6).toNumber()
  }

  render() {
    return(
      <Card>
        <CardTitle title="Last 24 hours" />
        <CardText>
          <div>
            Total fees: {this.calculateTotalFees()} ZRX
          </div>
        </CardText>
        <TradesTable />
      </Card>
    )
  }
}

export default connect((state) => {
  return {
    latestTrades: state.network.latestTrades,
  }
}, (dispatch) => {
  return bindActionCreators({
    //,
  }, dispatch)
})(Last24HoursStats)
