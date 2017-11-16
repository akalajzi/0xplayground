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

import { Loader } from 'src/components/common'

export default class WalletActivity extends Component {
  static propTypes = {
    tokenBalances: PropTypes.shape({
      address: PropTypes.string,
      symbol: PropTypes.string,
      decimals: PropTypes.number,
      amount: PropTypes.number,
    })
  }

  renderTokenBalances = (tokenBalances) => {
    const rows = []
    _.forEach(tokenBalances, (token, i) => {
      rows.push(
        <TableRow key={i}>
          <TableColumn>{ token.symbol }</TableColumn>
          <TableColumn>{ token.amount }</TableColumn>
        </TableRow>
      )
    })
    return rows
  }

  render() {
    const { tokenBalances } = this.props
    const loading = !tokenBalances

    if (loading) { return <Loader /> }
    return(
      <DataTable plain className='WalletActivity NarrowRows'>
        <TableBody>
          { this.renderTokenBalances(tokenBalances) }
        </TableBody>
      </DataTable>
    )
  }
}
