import React, { Component } from 'react'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'

import { Grid, Cell } from 'react-md'

import {
  CellTitle,
  TradesTable,
  WhitePaper,
} from 'src/components/common'
import { RELAY_LIST } from 'src/graphql/relay.graphql'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'
import { mapTokenList } from 'src/components/blockchain/helper'

import TradesStatsContainer from './TradesStatsContainer'


class MyTrades extends Component {

  render() {
    const { relayers, tokens, trades, wallet } = this.props
    const pageTitle = `Account ${wallet.activeAccount}`

    if (!wallet.activeAccount) {
      return(
        <div className='mytrades'>
          <WhitePaper>
            <CellTitle title='Wallet not reachable' />
            <Grid>
              <Cell align='stretch' size={12}>
                <div>
                  You need to have Metamask, Parity or Mist connected to your wallet for us to be able to pull your trading history.
                </div>
                <div>
                  0x.remote.hr doesn't collect or save any data directly from your wallet; it is used simply to provide address that we'll scan Ethereum blockchain for.
                </div>
                <div>
                  Alternatively, provide an address you're interested in, in the field bellow, or simply concatenate the url with the address.
                  <input />
                </div>
              </Cell>
            </Grid>
          </WhitePaper>
        </div>
      )
    }

    return(
      <div className='mytrades'>
        <WhitePaper>
          <Grid>
            <Cell align='stretch' size={12}>
              <CellTitle title={pageTitle} />
              <TradesStatsContainer
                address={wallet.activeAccount}
                tokens={tokens}
                relayers={relayers}
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
