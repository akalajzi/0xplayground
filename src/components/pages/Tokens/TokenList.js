import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { graphql, compose } from 'react-apollo'
import update from 'immutability-helper';
import _ from 'lodash'

import {
  Button,
  DialogContainer,
  TextField,
  DataTable,
  TableHeader,
  TableRow,
  TableColumn,
  TableBody,
  Grid,
  Cell,
} from 'react-md'

import INFURA from 'src/const/infura'
import { TOKEN_LIST_QUERY, CREATE_TOKEN_MUTATION, DELETE_TOKEN_MUTATION } from 'src/graphql/token.graphql'
import { connectZeroEx, mapTokenList } from 'src/components/blockchain/helper'

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
      this.props.createToken({
        name: newName.length ? newName : newSymbol,
        symbol: newSymbol,
        address: newContractAddress,
        decimals: newDecimals,
      })
      this.hide()
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
    this.setState({newDecimals: parseInt(value, 10)})
  }

  deleteToken = (id) => {
    this.props.deleteToken({id})
  }

  renderTokenItems = (tokens) => {
    const tokenItems = []

    _.forEach(tokens, (token, i) => {
      tokenItems.push(
        <TableRow key={i}>
          <TableColumn>{token.symbol}</TableColumn>
          <TableColumn>{token.name}</TableColumn>
          <TableColumn>{token.decimals}</TableColumn>
          <TableColumn>{i}</TableColumn>
          <TableColumn>
            {
              this.props.amMe &&
              <Button flat secondary onClick={this.deleteToken.bind(this, token.id)}>Delete</Button>
            }
          </TableColumn>
        </TableRow>
      )
    })
    return tokenItems
  }

  updateTokensFromProvider = () => {
    const zeroEx = connectZeroEx(INFURA.MAINNET)
    // TODO: see console log
    console.log('Check for existance before pushing it to gql');
    zeroEx.tokenRegistry.getTokensAsync()
      .then((tokens) => {
        _.forEach(tokens, (token) => {
          this.props.createToken({
            name: token.name,
            symbol: token.symbol,
            address: token.address,
            decimals: token.decimals,
          })
        })
      })
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
        <div className="">
          {
            this.props.amMe &&
            <div className="buttons__group">
              <Button raised onClick={this.show}>Add Token</Button>
              <Button raised secondary onClick={this.updateTokensFromProvider}>Update tokens from provider</Button>
            </div>
          }
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
        <DataTable plain className="TokenListTable">
          <TableHeader>
            <TableRow>
              <TableColumn>Symbol</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Decimals</TableColumn>
              <TableColumn>Address</TableColumn>
              <TableColumn></TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            { tokens && this.renderTokenItems(tokens) }
          </TableBody>
        </DataTable>
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

const deleteToken = graphql(DELETE_TOKEN_MUTATION, {
  props: ({ ownProps, mutate }) => ({
    deleteToken: ({ id }) => {
      mutate({
        variables: { id },
        updateQueries: {
          Tokens: (previousResult, { mutationResult }) => {
            const deletedToken = mutationResult.data.deleteToken
            return update(previousResult, {
              allTokens: {
                $set: previousResult.allTokens
                  .filter(token => deletedToken.id !== token.id)
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
  deleteToken,
)(TokenList)
