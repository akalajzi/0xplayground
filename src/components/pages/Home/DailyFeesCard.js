import React, { Component } from 'react'
import BigNumber from 'bignumber.js'
import _ from 'lodash'

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


import {Loader} from 'src/components/common'

export default class DailyFeesCard extends Component {

  bigNumberToNumber = (amount, decimals) => {
    if (!amount) { return 0 }

    if (typeof amount === "string") {
      amount = new BigNumber(amount)
    }
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
    const { relayers, zrxPrice, fiat } = this.props
    const zrxDecimals = 18
    const totalFeesFiat = zrxPrice * collectedFees.total

    const feesCol = relayers.map((relayer, key) => {
      return { address: relayer.address, volume: collectedFees.feeRecipients[relayer.address] }
    })
    const feesColSorted = _.sortBy(feesCol, 'volume').reverse()

    let rows = [
      <TableRow key='totalfees' className='TitleRow'>
        <TableColumn>Total Fees</TableColumn>
        <TableColumn>{collectedFees.total} ZRX</TableColumn>
        <TableColumn>
          {
            zrxPrice
            ? <span>{fiat.symbol} {totalFeesFiat.toFixed(fiat.decimal_digits)}</span>
            : '...'
          }
        </TableColumn>
        <TableColumn></TableColumn>
      </TableRow>
    ]

    _.forEach(feesColSorted, (item) => {
      const rFee = this.bigNumberToNumber(item.volume, zrxDecimals)
      const relayer = _.find(relayers, (relayer) => { return relayer.address === item.address})

      rows.push(
        <TableRow key={item.address}>
          <TableColumn>{relayer.name}</TableColumn>
          <TableColumn>{rFee} ZRX</TableColumn>
          <TableColumn>
            {
              zrxPrice
              ? <span>{fiat.symbol} {(rFee * zrxPrice).toFixed(fiat.decimal_digits)}</span>
              : '...'
            }
          </TableColumn>
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
      <Grid>
        <Cell size={8}>
          <DataTable plain className="FeesTable NarrowRows">
            <TableBody>
              { collectedFees && this.renderFees(collectedFees) }
            </TableBody>
          </DataTable>
        </Cell>
        <Cell size={4}>
          <Paper zDepth={0}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Tooltip />
                <Pie
                  data={feeRecipientsForChart}
                  dataKey='value'
                  innerRadius={0}
                  outerRadius={80}
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
        </Cell>
      </Grid>
    )
  }
}
