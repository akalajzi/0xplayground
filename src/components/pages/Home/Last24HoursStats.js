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

import { mapTokenList } from 'src/components/blockchain/helper'
import { RELAY_LIST } from 'src/graphql/relay.graphql'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'

import TradesTable from 'src/components/common/TradesTable'
import Loader from 'src/components/common/Loader'

class Last24HoursStats extends Component {

  bigNumberToNumber = (amount, decimals) => {
    return amount.div(10**decimals).toDigits(6).toNumber()
  }

  cleanTokensWithNoOrdersFilled = (tokenVolume) => {
    let result = {}
    _.forEach(this.props.tokens, (token) => {
      if (!tokenVolume[token.address].isZero()) {
        result[token.address] = this.bigNumberToNumber(tokenVolume[token.address], token.decimals)
      }
    })
    return result
  }

  calculateCollectedFees = () => {
    const { latestTrades, relayers, tokens } = this.props
    const zrxDecimals = 18

    let sum = new BigNumber(0)
    let feeRecipients = {}
    let tokenVolume = {}
    // prepare objects
    _.forEach(relayers, (relay) => { feeRecipients[relay.address] = new BigNumber(0) })
    _.forEach(tokens, (token) => { tokenVolume[token.address] = new BigNumber(0) })

    // loop through trades
    _.forEach(latestTrades, (trade) => {
      // total fees
      const totalFee = trade.args.paidMakerFee.add(trade.args.paidTakerFee)
      sum = sum.add(totalFee)
      // recipient
      feeRecipients[trade.args.feeRecipient] = feeRecipients[trade.args.feeRecipient].add(totalFee)
      // token volume groupings
      if (tokens[trade.args.makerToken]) {
        tokenVolume[trade.args.makerToken] = tokenVolume[trade.args.makerToken].add(trade.args.filledMakerTokenAmount)
      }
      if (tokens[trade.args.takerToken]) {
        tokenVolume[trade.args.takerToken] = tokenVolume[trade.args.takerToken].add(trade.args.filledTakerTokenAmount)
      }
    })
    const reducedTokenVolume = this.cleanTokensWithNoOrdersFilled(tokenVolume)

    return {
      total: this.bigNumberToNumber(sum, zrxDecimals),
      feeRecipients,
      tokenVolume: reducedTokenVolume,
    }
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
    const { relayers, tokens, latestTrades } = this.props
    console.log('this.props.latestTrades', latestTrades);
    if (!latestTrades.length) {
      return <Loader />
    }

    const collectedFees = this.calculateCollectedFees()
    console.log('relayers ', relayers);
    console.log('collectedFees ', collectedFees);

    return(
      <Card>
        <CardTitle title="Last 24 hours" />
        <CardText>
          <Grid>
            <Cell>
              <Paper zDepth={0}>
                <DataTable plain className="FeesTable">
                  <TableBody>
                    { collectedFees && this.renderFees(collectedFees) }
                  </TableBody>
                </DataTable>
              </Paper>
            </Cell>
            <Cell>
              <Paper zDepth={0}>
                <DataTable plain className="VolumeTable">
                  <TableBody>
                    { collectedFees.tokenVolume && this.renderTokenVolumes(collectedFees.tokenVolume) }
                  </TableBody>
                </DataTable>
              </Paper>
            </Cell>
          </Grid>
        </CardText>
        <TradesTable />
      </Card>
    )
  }
}

const tokenListQuery = graphql(TOKEN_LIST_QUERY, {
  props: ({ data: {allTokens} }) => ({
    tokens: mapTokenList(allTokens)
  }),
})

const relayListQuery = graphql(RELAY_LIST, {
  props: ({ data: {allRelays} }) => ({
    relayers: allRelays
  }),
})

export default compose(
  relayListQuery,
  tokenListQuery,
  connect((state) => {
    return {
      latestTrades: state.network.latestTrades,
    }
  })
)(Last24HoursStats)
