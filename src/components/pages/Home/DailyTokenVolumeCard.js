import React, { Component } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import {
  DataTable,
  Grid,
  Cell,
  TableBody,
  TableRow,
  TableColumn,
  Paper,
} from 'react-md'

import {
  PieChart,
  Pie,
  Cell as PieCell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import UI from 'src/const/ui'

const COLORS = UI.CHART_COLORS

import { Loader } from 'src/components/common'

export default class DailyTokenVolumeCard extends Component {

  tokenVolumeForChart = (tokenVolume, tokenPrices) => {
    let result = []
    _.forEach(tokenVolume, (tv, address) => {
      const price = tokenPrices ? parseFloat((tv * tokenPrices[address]).toFixed(2)) : 0
      result.push({ name: this.props.tokens[address].symbol, value: price })
    })
    return result
  }

  renderTokenVolumes = (tokenVolume) => {
    const { tokens, tokenPrices, fiat } = this.props

    let fiatVolume = 0.0
    _.forEach(tokenVolume, (volume, address) => {
      if (tokenPrices && tokenPrices[address]) {
        fiatVolume += volume * tokenPrices[address]
      }
    })

    const volumesCol = Object.keys(tokenVolume).map((address) => {
      return { address, volume: tokenVolume[address] * tokenPrices[address] }
    })
    const volColSorted = _.sortBy(volumesCol, 'volume').reverse()


    let rows = [
      <TableRow key='tvtotal' className='TitleRow'>
        <TableColumn>Total Volume</TableColumn>
        <TableColumn></TableColumn>
        <TableColumn>{
          tokenPrices
          ? `${fiat.symbol} ${fiatVolume.toFixed(fiat.decimal_digits)}`
          : '...'
        }</TableColumn>
      </TableRow>
    ]

    _.forEach(volColSorted, (item) => {
      const fiatVolume = tokenPrices
        ? `${fiat.symbol} ${item.volume.toFixed(fiat.decimal_digits)}`
        : '...'
      rows.push(
        <TableRow key={'tv' + item.address}>
          <TableColumn>{`${tokens[item.address].symbol} - ${tokens[item.address].name}`}</TableColumn>
          <TableColumn>{tokenVolume[item.address]}</TableColumn>
          <TableColumn>{fiatVolume}</TableColumn>
        </TableRow>
      )
    })
    return rows
  }

  render() {
    const { collectedFees, tokens, tokenPrices } = this.props
    const loading = !collectedFees || !tokens || !tokenPrices
    const tokenVolumeForChart = collectedFees && this.tokenVolumeForChart(collectedFees.tokenVolume, tokenPrices)

    if (loading) { return <Loader /> }
    return(
      <Grid>
        <Cell size={8}>
          <DataTable plain className="VolumeTable NarrowRows">
            <TableBody>
              { collectedFees.tokenVolume && this.renderTokenVolumes(collectedFees.tokenVolume) }
            </TableBody>
          </DataTable>
        </Cell>

        <Cell size={4}>
          <Paper zDepth={0}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Tooltip content={<CustomTooltip />}/>
                <Pie
                  data={tokenVolumeForChart}
                  dataKey='value'
                  innerRadius={0}
                  outerRadius={80}
                  fill='#8884d8'
                  paddingAngle={0}
                >
                  {
                    tokenVolumeForChart.map((entry, index) => {
                      return <PieCell key={index} fill={COLORS[index % COLORS.length]} />
                    })
                  }
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Cell>
      </Grid>
    )
  }
}

const CustomTooltip = (props) => {
  const {type, payload, label, active} = props
  if (active) {
    return (
      <div className='recharts-default-tooltip' style={{
        background: '#ffffff',
        padding: '10px',
        border: '1px solid #c3c3c3',
      }}>
        { payload[0]
          ? <div>
            <p className='recharts-tooltip-label'>{payload[0].name}</p>
            <span className='recharts-tooltip-item-value' style={{color: payload[0].fill}}>
              {`$ ${payload[0].value}`}
            </span>
          </div>
          : 'Missing data'
        }
      </div>
    )
  }
  return null
}
