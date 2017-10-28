import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'

import { Grid, Cell, Card, Paper } from 'react-md'

import Loader from 'src/components/common/Loader'
import TinyChart from 'src/components/common/TinyChart'
import UI from 'src/const/ui'
const CHART_COLORS = UI.CHART_COLORS

export default class HistoryGraphs extends Component {
  static propTypes = {
    history: PropTypes.array,
  }

  constructor(props) {
    super(props)

    this.state = {
      sevenDaysData: null,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.sevenDaysData && nextProps.history || this.props.history !== nextProps.history) {
      this.prepareDataForCharts(nextProps.history)
    }
  }

  prepareDataForCharts = (history) => {
    // if (!history) { return null }
    const historySorted = _.sortBy(history, 'timestamp').reverse()
    const sevenDays = _.slice(historySorted, 0, 31)

    // TODO: fix ordering, we dont want last day as first!
    const data = sevenDays.reverse().map((day) => {
      return {
        name: moment(day.timestamp * 1000).format('MM/DD/YYYY'),
        zrxUsdPrice: parseFloat(day.zrxUsdPrice.toFixed(6)),
        ethUsdPrice: parseFloat(day.ethUsdPrice.toFixed(4)),
        tradeVolume: day.tradeVolumeUsd,
        feesPaid: day.feesPaidTotal,
        // tradeVolume: day.tradeVolumeUsd ? day.tradeVolumeUsd.toFixed(2) : null, // data can be incomplete
        // feesPaid: day.feesPaidTotal ? day.feesPaidTotal.toFixed(2) : null,
      }
    })
    console.log('data => ', data);
    this.setState({ sevenDaysData: data})
    // return data
  }

  render() {
    const { history } = this.props
    const { sevenDaysData } = this.state

    const spanTitle = {
      fontSize: '18px',
      display: 'block',
    }
    const spanDescription = {
      fontSize: '12px',
      color: 'grey',
      display: 'block',
      marginBottom: '8px',
    }

    return (
      <Paper>
        <Grid>
          <Cell size={3}>
            <span style={spanTitle}>ZRX price</span>
            <span style={spanDescription}>* History chart of daily closing values</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='zrxUsdPrice' strokeColor={CHART_COLORS[0]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
          <Cell size={3}>
            <span style={spanTitle}>ETH price</span>
            <span style={spanDescription}>* History chart of daily closing values</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='ethUsdPrice' strokeColor={CHART_COLORS[1]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
          <Cell size={3}>
            <span style={spanTitle}>Trade volume over 0x protocol</span>
            <span style={spanDescription}>* Daily volume in USD based on traded tokens value at the time</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='tradeVolume' strokeColor={CHART_COLORS[2]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
          <Cell size={3}>
            <span style={spanTitle}>Fees Paid (ZRX)</span>
            <span style={spanDescription}>Total collected fees in ZRX by relayers</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='feesPaid' strokeColor={CHART_COLORS[3]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
        </Grid>
      </Paper>
    )
  }
}
