import React, { Component } from 'react'
import BigNumber from 'bignumber.js'

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


import Loader from 'src/components/common/Loader'

export default class DailyFeesCard extends Component {

  bigNumberToNumber = (amount, decimals) => {
    return amount.div(10**decimals).toDigits(6).toNumber()
  }

  feeRecipientsForChart = (feeRecipients) => {
    let result = []
      _.forEach(feeRecipients, (amount, address) => {
        result.push({
          name: this.props.relayers[address],
          value: this.bigNumberToNumber(amount, 18)
        })
      })
    return result
  }

  renderFees = (collectedFees) => {
    const { relayers } = this.props
    const zrxDecimals = 18

    let rows = [
      <TableRow key='totalfees'>
        <TableColumn>Total Fees</TableColumn>
        <TableColumn>{collectedFees.total} ZRX</TableColumn>
        <TableColumn>$123.45</TableColumn>
        <TableColumn></TableColumn>
      </TableRow>
    ]

    relayers.map((relayer, key) => {
      const rFee = this.bigNumberToNumber(collectedFees.feeRecipients[relayer.address], zrxDecimals)
      rows.push(
        <TableRow key={key}>
          <TableColumn>{relayer.name}</TableColumn>
          <TableColumn>{rFee} ZRX</TableColumn>
          <TableColumn>$123.45</TableColumn>
          <TableColumn>{rFee/collectedFees.total*100}%</TableColumn>
        </TableRow>
      )
    })
    return rows
  }

  render() {
    const { collectedFees, relayers } = this.props

    if (!collectedFees || !relayers) {
      return <Loader />
    }

    const feeRecipientsForChart = this.feeRecipientsForChart(collectedFees.feeRecipients)

    return(
      <Card>
        <CardTitle title="24h Fees Collected" subtitle={`${collectedFees.total} ZRX`} />
        <CardText>
          <Paper zDepth={0}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={feeRecipientsForChart}
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
                    feeRecipientsForChart.map((entry, index) => {
                      return <PieCell key={index} fill={COLORS[index % COLORS.length]} />
                    })
                  }
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </CardText>
        <CardText>
          <DataTable plain className="FeesTable">
            <TableBody>
              { collectedFees && this.renderFees(collectedFees) }
            </TableBody>
          </DataTable>
        </CardText>
      </Card>
    )
  }
}
