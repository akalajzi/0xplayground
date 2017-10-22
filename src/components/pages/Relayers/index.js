import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'

import _ from 'lodash'

import {
  Card,
  CardTitle,
  DataTable,
  TableHeader,
  TableRow,
  TableColumn,
  TableBody,
} from 'react-md'

import { RELAY_LIST } from 'src/graphql/relay.graphql'


class Relayers extends Component {

  renderRelayers = (relayers) => {
    const rows = []

    _.forEach(relayers, (relayer, i) => {
      if (relayer.name !== 'OTC') {
        rows.push(
          <TableRow key={i}>
            <TableColumn>{relayer.name}</TableColumn>
            <TableColumn>
              {relayer.url
                ? <a href={relayer.url} target="_blank" alt={relayer.name}>{relayer.url}</a>
                : 'N/A'
              }
            </TableColumn>
            <TableColumn>{relayer.makerFee ? `${relayer.makerFee}%` : 'N/A'}</TableColumn>
            <TableColumn>{relayer.takerFee ? `${relayer.takerFee}%` : 'N/A'}</TableColumn>
          </TableRow>
        )
      }
    })
    return rows
  }

  render() {
    const { relayers } = this.props
    return (
      <div className="history">
        <Card>
          <CardTitle title='List of known relayers' />
          <DataTable plain className="TokenListTable">
            <TableHeader>
              <TableRow>
                <TableColumn>Name</TableColumn>
                <TableColumn>URL</TableColumn>
                <TableColumn>Maker Fee</TableColumn>
                <TableColumn>Taker Fee</TableColumn>
              </TableRow>
            </TableHeader>
            <TableBody>
              { relayers && this.renderRelayers(relayers) }
            </TableBody>
          </DataTable>
        </Card>
      </div>
    )
  }
}

const relayListQuery = graphql(RELAY_LIST, {
  props: ({ data: {allRelays} }) => ({
    relayers: allRelays
  }),
})

export default compose(
  relayListQuery,
)(Relayers)
