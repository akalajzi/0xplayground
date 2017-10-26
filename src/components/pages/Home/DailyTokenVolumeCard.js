import React, { Component } from 'react'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'
import { graphql, compose } from 'react-apollo'
import _ from 'lodash'

import PropTypes from 'prop-types'
import {
  Card,
  CardTitle,
  CardText,
  DataTable,
  Grid,
  Cell,
  TableHeader,
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
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9148fb'];

import { mapTokenList } from 'src/components/blockchain/helper'
import { RELAY_LIST } from 'src/graphql/relay.graphql'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'

import TradesTable from 'src/components/common/TradesTable'
import DailyFeesCard from './DailyFeesCard'
import Loader from 'src/components/common/Loader'

export default class DailyTokenVolumeCard extends Component {

  tokenVolumeForChart = (tokenVolume) => {
    let result = []
    _.forEach(tokenVolume, (tv, address) => {
      result.push({ name: this.props.tokens[address], value: tv })
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


    let rows = [
      <TableRow key='tvtotal'>
        <TableColumn>Total Volume</TableColumn>
        <TableColumn></TableColumn>
        <TableColumn>{
          tokenPrices
          ? `${fiat.symbol} ${fiatVolume.toFixed(fiat.decimal_digits)}`
          : '...'
        }</TableColumn>
      </TableRow>
    ]

    for (let address in tokenVolume) {
      if (tokenVolume.hasOwnProperty(address)) {
        const fiatVolume = tokenPrices
          ? `${fiat.symbol} ${(tokenVolume[address] * tokenPrices[address]).toFixed(fiat.decimal_digits)}`
          : '...'
        rows.push(
          <TableRow key={'tv' + address}>
            <TableColumn>{tokens[address].name}</TableColumn>
            <TableColumn>{tokenVolume[address]}</TableColumn>
            <TableColumn>{fiatVolume}</TableColumn>
          </TableRow>
        )
      }
    }
    return rows
  }

  render() {
    const { collectedFees, tokens } = this.props

    if (!collectedFees || !tokens) {
      return <Loader />
    }

    const tokenVolumeForChart = this.tokenVolumeForChart(collectedFees.tokenVolume)

    return(
      <Card>
        <CardTitle title="24h Token Volume"/>
        <CardText>
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
        </CardText>
      </Card>
    )
  }
}
