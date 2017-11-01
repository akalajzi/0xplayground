import React, { Component } from 'react'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import update from 'immutability-helper';

import {
  Button,
  Cell,
  Divider,
  Grid,
  TextField,
  Paper,
} from 'react-md'

import { CREATE_SCRIBBLE_MESSAGE, SCRIBBLE_LIST_LIMITED } from 'src/graphql/scribble.graphql'
import { Wallet, CellTitle,WhitePaper } from 'src/components/common'
import MessageList from './MessageList'

class Scribble extends Component {
  constructor(props) {
    super(props)

    this.state = {
      msg: '',
      author: null,
    }
  }

  handleMsgSubmit = () => {
    this.props.createScribbleMessage({
      text: this.state.msg,
      author: this.props.wallet.activeAccount,
    })
    this.setState({msg: ''})
  }

  handleMsgChange = (msg) => {
    this.setState({ msg: msg })
  }

  render() {
    const { wallet, messages } = this.props
    const me = "0xdc5f5a9c3eb2f16db36c6c7f889f83dd232d71af"
    const amMe = wallet.activeAccount === me

    return(
      <div className="Scribble">
        <Grid>
          <Wallet />
        </Grid>
        <WhitePaper>
          <CellTitle title='Scribble' />
          <Grid>
            <Cell size={8}>
              <TextField
                id="multiline-counter-field"
                label="Write down your suggestions or just say hi"
                placeholder="Words words words"
                rows={1}
                maxLength={300}
                className="md-cell md-cell--bottom"
                style={{ width: '100%'}}
                value={this.state.msg}
                onChange={msg => this.setState({msg})}
              />
              {
                !wallet.activeAccount &&
                <div className='NoWalletConnected'>* You need to be connected to your wallet to be able to post. Try
                  &nbsp;<a target='_blank' alt='Metamask Chrome Webstore' href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn'>Metamask</a>!
                </div>
              }
              <Button
                primary
                raised
                disabled={this.state.msg.length === 0 || !wallet.activeAccount}
                className='sendBtn'
                onClick={this.handleMsgSubmit.bind(this)}
              >Send</Button>
            </Cell>
            <Cell size={4}>

            </Cell>
          </Grid>
          <Divider />
          <Grid>
            <Cell size={12} align='stretch'>
              <MessageList
                me={me}
                activeAccount={wallet.activeAccount}
                messages={messages}
              />
            </Cell>
          </Grid>
        </WhitePaper>
      </div>
    )
  }
}

const scribbleListQuery = graphql(SCRIBBLE_LIST_LIMITED, {
  props: ({ data: {allScribbleMessages}}) => ({
    messages: allScribbleMessages,
  })
})

const createScribbleMessage = graphql(CREATE_SCRIBBLE_MESSAGE, {
  props: ({ ownProps, mutate }) => ({
    createScribbleMessage: ({ text, author }) =>
      mutate({
        variables: { text, author },
        optimisticResponse: {
          __typename: 'Mutation',
          createScribbleMessage: {
            __typename: 'ScribbleMessage',
            id: null,
            text,
            author,
            createdAt: new Date().toISOString(),
          }
        },
        updateQueries: {
          ScribbleMessage: (previousResult, { mutationResult }) => {
            const newScribbleMessage = mutationResult.data.createScribbleMessage
            return update(previousResult, {
              allScribbleMessages: {
                $unshift: [newScribbleMessage]
              }
            })
          }
        }
      })
  })
})

export default compose(
  scribbleListQuery,
  createScribbleMessage,
  connect((state) => {
    return {
      wallet: state.wallet,
    }
  })
)(Scribble)
