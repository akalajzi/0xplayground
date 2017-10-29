import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import _ from 'lodash'

import { Grid, Cell, Card, Paper, FontIcon, Tooltipped } from 'react-md'

import { fetchCurrentZrxPrice, fetchCurrentEthPrice } from 'src/util/marketApi'

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

    this.priceInterval = null
    this.state = {
      sevenDaysData: null,
      zrxPrice: null,
      zrxChange: null,
      ethPrice: null,
      ethChange: null,
    }
  }

  componentDidMount() {
    this.fetchZrxEthPrices()
    this.priceInterval = setInterval(() => {
      this.fetchZrxEthPrices()
    }, 30000)

  }

  componentWillUnmount() {
    clearInterval(this.priceInterval)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.sevenDaysData && nextProps.history || this.props.history !== nextProps.history) {
      this.prepareDataForCharts(nextProps.history)
    }
  }

  fetchZrxEthPrices = () => {
    fetchCurrentZrxPrice()
    .then((res) => {
      this.setState({
        zrxPrice: res.data[0]['price_usd'],
        zrxChange: res.data[0]['percent_change_1h'],
      })
    })
    fetchCurrentEthPrice()
    .then((res) => {
      this.setState({
        ethPrice: res.data[0]['price_usd'],
        ethChange: res.data[0]['percent_change_1h'],
      })
    })
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
        tradeVolume: day.tradeVolumeUsd ? parseFloat(day.tradeVolumeUsd.toFixed(2)) : null, // data can be incomplete
        feesPaid: day.feesPaidTotal ? parseFloat(day.feesPaidTotal.toFixed(2)) : null,
      }
    })
    this.setState({ sevenDaysData: data})
  }

  render() {
    const { history } = this.props
    const { sevenDaysData, zrxPrice, zrxChange, ethPrice, ethChange } = this.state

    const spanTitle = {
      fontSize: '18px',
      display: 'inline-block',
    }
    const spanPrice = {
      float: 'right',
      fontSize: '18px',
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
            <PriceChange float='right' change={zrxChange} />
            <span style={spanPrice}>
              { zrxPrice && `$ ${zrxPrice}`}
            </span>
            <span style={spanDescription}>* History chart of daily closing values</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='zrxUsdPrice' unit='$' strokeColor={CHART_COLORS[0]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
          <Cell size={3}>
            <span style={spanTitle}>ETH price</span>
            <PriceChange float='right' change={ethChange} />
            <span style={spanPrice}>{ ethPrice && `$ ${ethPrice}`}</span>
            <span style={spanDescription}>* History chart of daily closing values</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='ethUsdPrice' unit='$' strokeColor={CHART_COLORS[1]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
          <Cell size={3}>
            <span style={spanTitle}>Trade volume over 0x protocol</span>
            <span style={spanDescription}>* Daily volume in USD based on traded tokens value at the time</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='tradeVolume' unit='$' strokeColor={CHART_COLORS[2]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
          <Cell size={3}>
            <span style={spanTitle}>Fees Paid (ZRX)</span>
            <span style={spanDescription}>Total collected fees in ZRX by relayers</span>
            { sevenDaysData
              ? <TinyChart data={sevenDaysData} dataKey='feesPaid' unit='ZRX' strokeColor={CHART_COLORS[3]} strokeWidth={2} />
              : <Loader />
            }
          </Cell>
        </Grid>
      </Paper>
    )
  }
}

const PriceChange = ({change, float}) => {
  let icon = null
  let priceChange = null
  if (change > 0) {
    icon = <FontIcon style={{fontSize: '16px', color: 'green', padding: '4px 0 0 4px'}} inherit>trending_up</FontIcon>
    priceChange = <span style={{fontSize: '12px', color: 'green', verticalAlign: 'text-bottom'}}>{`${change}%`}</span>
  } else if (change < 0) {
    icon = <FontIcon style={{fontSize: '16px', color: 'red', padding: '4px 0 0 4px'}} inherit>trending_down</FontIcon>
    priceChange = <span style={{fontSize: '12px', color: 'red', verticalAlign: 'text-bottom'}}>{`${change}%`}</span>
  } else {
    icon = <FontIcon style={{fontSize: '16px', color: 'grey', padding: '4px 0 0 4px'}} inherit>trending_flat</FontIcon>
    priceChange = <span style={{fontSize: '12px', color: 'grey', verticalAlign: 'text-bottom'}}>{`${change}%`}</span>
  }

  return (
    <div style={{ float: float }}>
      <Tooltipped
        label="1 hour change"
        position="top"
      ><div style={{position: 'relative'}}>{icon} {priceChange}</div>
      </Tooltipped>
    </div>
  )
}
