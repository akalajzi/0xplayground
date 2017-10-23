import React, { Component } from 'react'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'
import { graphql, compose } from 'react-apollo'

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
    const { tokens } = this.props
    let rows = [
      <TableRow key='tvtotal'>
        <TableColumn>Total Volume</TableColumn>
        <TableColumn></TableColumn>
        <TableColumn>123.45$</TableColumn>
        <TableColumn></TableColumn>
      </TableRow>
    ]

    for (let address in tokenVolume) {
      if (tokenVolume.hasOwnProperty(address)) {
        rows.push(
          <TableRow key={'tv' + address}>
            <TableColumn>{tokens[address].name}</TableColumn>
            <TableColumn>{tokenVolume[address]}</TableColumn>
            <TableColumn>$123.45</TableColumn>
            <TableColumn></TableColumn>
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
        <CardTitle title="24h Token Volume" subtitle="12312$" />
        <CardText>
          <Paper zDepth={0}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={tokenVolumeForChart}
                  dataKey='value'
                  cx='50%'
                  cy='99%'
                  startAngle={180}
                  endAngle={0}
                  innerRadius={0}
                  outerRadius={120}
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
        </CardText>
        <CardText>
          <DataTable plain className="VolumeTable">
            <TableBody>
              { collectedFees.tokenVolume && this.renderTokenVolumes(collectedFees.tokenVolume) }
            </TableBody>
          </DataTable>
        </CardText>
      </Card>
    )
  }
}
