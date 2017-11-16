import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import _ from 'lodash'

import { Button, Grid, Cell, TextField } from 'react-md'

import {
  CellTitle,
  TradesTable,
  WhitePaper,
} from 'src/components/common'
import { RELAY_LIST } from 'src/graphql/relay.graphql'
import { TOKEN_LIST_QUERY } from 'src/graphql/token.graphql'
import { mapTokenList } from 'src/components/blockchain/helper'
import { validateEthAddress } from 'src/util/validators'

import TradesStatsContainer from './TradesStatsContainer'
import EthAccount from './EthAccount'


class MyTrades extends Component {
  static propTypes = {
    match: PropTypes.shape({
      isExact: PropTypes.bool,
      params: PropTypes.object,
      path: PropTypes.string,
      url: PropTypes.string,
    }),
    relayers: PropTypes.array,
    tokens: PropTypes.object,
    trades: PropTypes.array,
    wallet: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      addressInput: '',
      addressInputError: false,
    }
  }

  onAddressChange = (value) => {
    this.setState({ addressInput: value, addressInputError: false })
  }

  submitAddress = () => {
    if (validateEthAddress(this.state.addressInput)) {
      window.location = `/account/${this.state.addressInput}`
    } else {
      this.setState({ addressInputError: true })
    }
  }

  render() {
    const { relayers, tokens, trades, wallet, match } = this.props

    const activeAccount = match.params.address || wallet.activeAccount
    const pageTitle = `Account ${activeAccount}`

    if (!activeAccount) {
      return(
        <div className='MyTrades'>
          <WhitePaper>
            <CellTitle title='Wallet not reachable' />
            <Grid>
              <Cell align='stretch' size={12}>
                <div>
                  You need to have Metamask, Parity or Mist connected to your wallet for us to be able to pull your trading history.
                </div>
                <div className='text-description' style={{ paddingBottom: '30px' }}>
                  * 0x.remote.hr doesn't collect or save any data directly from your wallet; it is used simply to provide address that we'll scan Ethereum blockchain for.
                </div>
                <div>
                  Alternatively, provide an address you're interested in, in the field bellow, or simply concatenate the url with the address.
                </div>
                <TextField
                  id='address-field'
                  label='Ethereum address'
                  lineDirection='left'
                  className='address-input'
                  onChange={this.onAddressChange}
                  error={this.state.addressInputError}
                  errorText='Has to be valid ethereum address'
                />
                <Button
                  raised
                  secondary
                  disabled={this.state.addressInputError}
                  className='address-input-btn'
                  onClick={this.submitAddress}
                >Go</Button>
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
                address={activeAccount}
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
