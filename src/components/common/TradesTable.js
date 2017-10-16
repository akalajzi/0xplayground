import React, { Component } from 'react'
import { connect } from 'react-redux'

import ETH from 'src/const/eth'

import {
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
} from 'react-md';

import TokenAmount from 'src/components/common/TokenAmount'
import RelayerLink from 'src/components/common/RelayerLink'

class TradesTable extends Component {

  renderRelayer = (trade) => {
    const { networkId } = this.props

    if (trade.args.feeRecipient === '0x0000000000000000000000000000000000000000') {
      return 'OTC'
    } else if (ETH.ZEROEX_RELAY_ADDRESSES[networkId][trade.args.feeRecipient]) {
      return <RelayerLink address={trade.args.feeRecipient} networkId={networkId} />
    } else {
      // TODO: track unknown
      return 'Unknown'
    }
  }

  render() {
    const { logs, tokens, networkId } = this.props
    return(
      <DataTable plain className="TradesTable">
        <TableHeader>
          <TableRow>
            <TableColumn>Time</TableColumn>
            <TableColumn>Trade</TableColumn>
            <TableColumn>Price</TableColumn>
            <TableColumn>Relay</TableColumn>
            <TableColumn>Maker Fee</TableColumn>
            <TableColumn>Taker Fee</TableColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            logs && logs.map((trade, i) => {
              return (
                <TableRow key={i}>
                  <TableColumn>timestamp</TableColumn>
                  <TableColumn>
                    trade
                  </TableColumn>
                  <TableColumn>
                    price
                  </TableColumn>
                  <TableColumn>
                    { this.renderRelayer(trade) }
                  </TableColumn>
                  <TableColumn>
                    <TokenAmount
                      showSymbol
                      amount={trade.args.paidMakerFee}
                      tokenAddress={trade.args.makerToken}
                    />
                  </TableColumn>
                  <TableColumn>
                    <TokenAmount
                      showSymbol
                      amount={trade.args.paidTakerFee}
                      tokenAddress={trade.args.takerToken}
                    />
                  </TableColumn>
                </TableRow>
              )
            })
          }
        </TableBody>
      </DataTable>
    )
  }
}

export default connect((state) => {
  return {
    networkId: state.network.id,
    logs: state.network.logs,
    tokens: state.network.tokens,
  }
})(TradesTable)
