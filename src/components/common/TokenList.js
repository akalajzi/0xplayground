import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql, compose } from 'react-apollo'
import update from 'immutability-helper';
import _ from 'lodash'

import { List, ListItem, Button, DialogContainer, TextField } from 'react-md'

import { TOKEN_LIST_QUERY, CREATE_TOKEN_MUTATION } from 'src/graphql/token.graphql'
import { mapTokenList } from 'src/components/blockchain/helper'

class TokenList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      addTokenModalShow: false,
      newName: '',
      newContractAddress: '',
      newSymbol: '',
      newDecimals: 18,
    }
  }

  show = () => {
    this.setState({ addTokenModalShow: true })
  }

  hide = () => {
    this.setState({ addTokenModalShow: false })
  }

  newTokenSubmit = () => {
    const { newContractAddress, newSymbol, newDecimals, newName } = this.state
    if (newContractAddress.length && newSymbol.length && newDecimals) {
      console.log('We should save this ', this.state);
      this.props.createToken({
        name: newName.length ? newName : newSymbol,
        symbol: newSymbol,
        address: newContractAddress,
        decimals: newDecimals,
      })
    }
  }

  onContractAddressChange = (value) => {
    this.setState({newContractAddress: value})
  }

  onTokenNameChange = (value) => {
    this.setState({newName: value})
  }

  onSymbolChange = (value) => {
    this.setState({newSymbol: value.toUpperCase()})
  }

  onDecimalsChange = (value) => {
    if (_.isNumber(value)) {
      this.setState({newDecimals: value})
    } else {
      console.error("Not a number!")
    }
  }

  renderTokenItems = (tokens) => {
    const tokenItems = []

    const out = _.forEach(tokens, (token, i) => {
      tokenItems.push(
        <ListItem
          key={i}
          primaryText={`${token.symbol} - ${token.name}`}
          secondaryText={`${token.decimals} decimals`}
        />
      )
    })
    return tokenItems
  }

  render() {
    const {tokens} = this.props
    const { addTokenModalShow } = this.state
    const addTokenModalActions = [
      { secondary: true, children: 'Cancel', onClick: this.hide },
      <Button flat primary onClick={this.newTokenSubmit}>Confirm</Button>
    ]

    return(
      <div>
        <h1>TokenList</h1>
        <div className="">
          <Button raised onClick={this.show}>Add Token</Button>
          <DialogContainer
            id="simple-action-dialog"
            visible={addTokenModalShow}
            onHide={this.hide}
            actions={addTokenModalActions}
            title="Add Token"
          >
            <TextField id="token-contract-address" label="Contract Address" onChange={this.onContractAddressChange} />
            <TextField id="token-name" label="Token Name" onChange={this.onTokenNameChange} />
            <TextField id="token-symbol" label="Token Symbol" placeholder="TOK" onChange={this.onSymbolChange} value={this.state.newSymbol} />
            <TextField id="token-decimals" label="Decimals of Precision" defaultValue="18" type='number' onChange={this.onDecimalsChange} />
          </DialogContainer>
        </div>
        <List>
          { tokens && this.renderTokenItems(tokens) }
        </List>

      </div>
    )
  }
}

const tokenListQuery = graphql(TOKEN_LIST_QUERY, {
  props: ({ data: {allTokens} }) => ({
    tokens: mapTokenList(allTokens)
  }),
})

const createToken = graphql(CREATE_TOKEN_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    createToken: ({ name, symbol, address, decimals }) => {
      mutate({
        variables: { name, symbol, address, decimals },
        optimisticResponse: {
          __typename: 'Mutation',
          createToken: {
            __typename: 'Token',
            id: null,
            name,
            symbol,
            address,
            decimals,
          }
        },
        updateQueries: {
          Tokens: (previousResult, { mutationResult }) => {
            const newToken = mutationResult.data.createToken
            return update(previousResult, {
              allTokens: {
                $unshift: [newToken]
              }
            })
          }
        }
      })
    }
  })
})

export default compose(
  tokenListQuery,
  createToken,
)(TokenList)
