import React, { PureComponent } from 'react'
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
import _ from 'lodash'

import { TokenAmount, TooltipLink } from 'src/components/common'

import ETH from 'src/const/eth'

class TradesTable extends PureComponent {
  // static propTypes = {
  //   relayers:
  //   tokens:
  //   latestTrades:
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
    const {tokens, market} = this.props
    let tableRows = []
    const zrx = _.find(tokens, (token) => {
      return token.symbol === 'ZRX'
    })

    _.forEach(trades, (trade, key) => {
      let cssRow = ''
      const walletIsMaker = trade.args.maker === walletAccount
      const walletIsTaker = trade.args.taker === walletAccount
      const totalFee = new BigNumber(trade.args.paidMakerFee).add(new BigNumber(trade.args.paidTakerFee))
      const zrxDollarCost = totalFee.div(10**18).toDigits(6).toNumber() * market.zrxPrice
      const gasUsed = trade.gasUsed || 0
      const gasDollarCost = (new BigNumber(gasUsed).div(10**9).toNumber()) * trade.gasPrice * market.ethPrice
      const totalDollarCost = (zrxDollarCost + gasDollarCost).toFixed(2)

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
          <TableColumn>
            {trade.gasUsed}
          </TableColumn>
          <TableColumn>
            $ { totalDollarCost }
          </TableColumn>
        </TableRow>
      )
    })
    return tableRows
  }

  render() {
    const { latestTrades, walletAccount, tokens } = this.props
    const readyToRender = latestTrades && tokens
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
            <TableColumn>Gas Used</TableColumn>
            <TableColumn>Fee + Gas</TableColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          { readyToRender && this.renderTrades(latestTrades, walletAccount) }
        </TableBody>
      </DataTable>
    )
  }
}

export default compose(
  connect((state) => {
    return {
      networkId: state.network.id,
      walletAccount: state.wallet.activeAccount,
      market: state.market,
    }
  })
)(TradesTable)
