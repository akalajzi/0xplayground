import React, { Component } from 'react'
import { connect } from 'react-redux'

import ETH from 'src/const/eth'

import {
  FontIcon,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
} from 'react-md';

import TokenAmount from 'src/components/common/TokenAmount'
import RelayerLink from 'src/components/common/RelayerLink'
import TooltipLink from 'src/components/common/TooltipLink'

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

  renderTrade = (trade) => {
    return(
      <div>
        { this.renderTransactionIcon(trade) }
        <TokenAmount
          showSymbol
          amount={trade.args.filledMakerTokenAmount}
          tokenAddress={trade.args.makerToken}
        />
        <FontIcon style={{
          verticalAlign: 'text-top',
          fontSize: '16px',
          padding: '0px 4px',
        }}>swap_horiz</FontIcon>
        <TokenAmount
          showSymbol
          amount={trade.args.filledTakerTokenAmount}
          tokenAddress={trade.args.takerToken}
        />
      </div>
    )
  }

  renderTransactionIcon = (trade) => {
    const networkId = this.props.networkId
    const url = ETH.NETWORK_BLOCK_EXPLORER[networkId] + '/tx/' + trade.transactionHash
    return(
      <TooltipLink
        tooltipLabel='Click to see transaction'
        tooltipPosition='top'
        href={url}
        target='_blank'
      >
        <FontIcon
          primary
          style={{
            paddingRight: '10px',
            fontSize: '16px',
            verticalAlign: 'text-top',
        }}>assignment_late</FontIcon>
      </TooltipLink>
    )
  }

  render() {
    const { logs, tokens, networkId, zrxContractAddress } = this.props
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
                    { this.renderTrade(trade) }
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
                      tokenAddress={zrxContractAddress}
                    />
                  </TableColumn>
                  <TableColumn>
                    <TokenAmount
                      showSymbol
                      amount={trade.args.paidTakerFee}
                      tokenAddress={zrxContractAddress}
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
    zrxContractAddress: state.network.zrxContractAddress,
  }
})(TradesTable)
