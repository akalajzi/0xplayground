import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import { graphql, compose } from 'react-apollo'
import BigNumber from 'bignumber.js'
import {
  FontIcon,
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
} from 'react-md'

// import { mapTokenList } from 'src/components/blockchain/helper'

import TokenAmount from 'src/components/common/TokenAmount'
import TooltipLink from 'src/components/common/TooltipLink'

import ETH from 'src/const/eth'
// import { RELAY_LIST } from 'src/graphql/relay.graphql'
// import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'

class TradesTable extends Component {
  // static propTypes = {
  //   relayers:
  //   tokens:
  // }

  renderRelayer = (trade) => {
    const { relayers } = this.props

    const relayer = _.find(relayers, (relayer) => relayer.address === trade.args.feeRecipient)
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
          token={this.props.tokens[trade.args.makerToken]}
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
          token={this.props.tokens[trade.args.takerToken]}
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

  renderTrades = (trades, walletAccount) => {
    const {tokens} = this.props
    let tableRows = []
    const zrx = _.find(tokens, (token) => {
      return token.symbol === 'ZRX'
    })

    _.forEach(trades, (trade, key) => {
      let cssRow = ''
      const walletIsMaker = trade.args.maker === walletAccount
      const walletIsTaker = trade.args.taker === walletAccount
      const totalFee = new BigNumber(trade.args.paidMakerFee).add(new BigNumber(trade.args.paidTakerFee))

      if (walletIsMaker || walletIsTaker) {
        cssRow = 'bg-my-highlight'
      }

      tableRows.push(
        <TableRow key={key} className={cssRow}>
          <TableColumn>
            { trade.timestamp ? moment(trade.timestamp*1000).format('MM/DD/YYYY - HH:mm:ss') : trade.transactionHash }
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
              token={zrx}
            />
          </TableColumn>
          <TableColumn>
            <TokenAmount
              showSymbol
              amount={trade.args.paidTakerFee}
              token={zrx}
            />
          </TableColumn>
          <TableColumn>
            <TokenAmount
              showSymbol
              amount={totalFee}
              token={zrx}
            />
          </TableColumn>
        </TableRow>
      )
    })
    return tableRows
  }

  sort = (trades) => {
    if (!trades) { return null }
    // TODO: do actual sorting by timestamp
    return trades
  }

  render() {
    const { latestTrades, walletAccount } = this.props
    const sortedTrades = this.sort(latestTrades)
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
          { latestTrades && this.renderTrades(sortedTrades, walletAccount) }
        </TableBody>
      </DataTable>
    )
  }
}

// const relayListQuery = graphql(RELAY_LIST, {
//   props: ({ data: {allRelays} }) => ({
//     relayers: allRelays
//   }),
// })
//
// const tokenListQuery = graphql(TOKEN_LIST_QUERY, {
//   props: ({ data: {allTokens} }) => ({
//     tokens: mapTokenList(allTokens)
//   }),
// })

export default compose(
  // relayListQuery,
  // tokenListQuery,
  connect((state) => {
    return {
      networkId: state.network.id,
      // latestTrades: state.network.latestTrades,
      walletAccount: state.wallet.activeAccount,
    }
  })
)(TradesTable)
