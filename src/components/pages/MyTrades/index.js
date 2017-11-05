import React, { Component } from 'react'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'

import { Grid, Cell } from 'react-md'

import {
  CellTitle,
  TradesTable,
  Wallet,
  WhitePaper,
} from 'src/components/common'
import { RELAY_LIST } from 'src/graphql/relay.graphql'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'
import { mapTokenList } from 'src/components/blockchain/helper'

import MyTradesTable from './MyTradesTable'


class MyTrades extends Component {

  render() {
    const { relayers, tokens, trades, wallet } = this.props
    const amMe = wallet.activeAccount === "0xdc5f5a9c3eb2f16db36c6c7f889f83dd232d71af"
    console.log('this.props ', this.props);

    return(
      <div className="mytrades">
        <Wallet />
        <WhitePaper>
          <Grid>
            <Cell align='stretch' size={12}>
              <CellTitle title='My Trades' />
              <MyTradesTable
                relayers={relayers}
                tokens={tokens}
                wallet={wallet}
              />
            </Cell>
          </Grid>
        </WhitePaper>
      </div>
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
      wallet: state.wallet,
    }
  })
)(MyTrades)
