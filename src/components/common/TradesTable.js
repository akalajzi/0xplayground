import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { graphql, compose } from 'react-apollo'
import {
  FontIcon,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
} from 'react-md';

import TokenAmount from 'src/components/common/TokenAmount'
import TooltipLink from 'src/components/common/TooltipLink'

import ETH from 'src/const/eth'
import { RELAY_LIST } from 'src/graphql/relay.graphql'

class TradesTable extends Component {

  renderRelayer = (trade) => {
    const { networkId, relayers } = this.props

    const relayer = _.find(relayers, (relay) => relay.address === trade.args.feeRecipient)
    if (relayer) {
      return relayer.url
        ? <a href={relayer.url} target='_blank'>{relayer.name}</a>
        : <span>{relayer.name}</span>
    } else {
      // TODO: track unknown
      return 'Unknown'
    }
  }

  renderTrade = (trade, walletIsMaker, walletIsTaker) => {
    return(
      <div>
        { this.renderTransactionIcon(trade) }
        <TokenAmount
          showSymbol
          highlight={walletIsMaker}
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
          highlight={walletIsTaker}
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
          secondary
          style={{
            paddingRight: '10px',
            fontSize: '16px',
            verticalAlign: 'text-top',
          }}
        >assignment_late</FontIcon>
      </TooltipLink>
    )
  }

  renderTrades = (logs, walletAccount) => {
    let tableRows = []

    for (let key in logs) {
      if (logs.hasOwnProperty(key)) {
        const trade = logs[key]
        let cssRow = ''

        const walletIsMaker = trade.args.maker === walletAccount
        const walletIsTaker = trade.args.taker === walletAccount

        const totalFee = trade.args.paidMakerFee.add(trade.args.paidTakerFee)

        if (walletIsMaker || walletIsTaker) {
          cssRow = 'bg-my-highlight'
        }

        tableRows.push(
          <TableRow key={key} className={cssRow}>
            <TableColumn>
              { trade.timestamp ? moment(trade.timestamp*1000).format('MM/DD/YYYY - HH:mm:ss') : key }
            </TableColumn>
            <TableColumn>
              { this.renderTrade(trade, walletIsMaker, walletIsTaker) }
            </TableColumn>
            <TableColumn>
              { trade.price }
            </TableColumn>
            <TableColumn>
              { this.renderRelayer(trade) }
            </TableColumn>
            <TableColumn>
              <TokenAmount
                showSymbol
                amount={trade.args.paidMakerFee}
                tokenAddress={this.props.zrxContractAddress}
              />
            </TableColumn>
            <TableColumn>
              <TokenAmount
                showSymbol
                amount={trade.args.paidTakerFee}
                tokenAddress={this.props.zrxContractAddress}
              />
            </TableColumn>
            <TableColumn>
              <TokenAmount
                showSymbol
                amount={totalFee}
                tokenAddress={this.props.zrxContractAddress}
              />
            </TableColumn>
          </TableRow>
        )
      }
    }
    // TODO: Fix this, and sort properly
    return tableRows.reverse()
  }

  render() {
    const { logs, tokens, networkId, walletAccount } = this.props
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
            <TableColumn>Total Fee</TableColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          { logs && this.renderTrades(logs, walletAccount) }
        </TableBody>
      </DataTable>
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
  connect((state) => {
    return {
      networkId: state.network.id,
      logs: state.network.logs,
      tokens: state.network.tokens,
      zrxContractAddress: state.network.zrxContractAddress,
      walletAccount: state.wallet.activeAccount,
    }
  })
)(TradesTable)
