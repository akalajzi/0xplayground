import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import {
  Grid,
  Cell,
  FontIcon,
} from 'react-md'

export default class MessageList extends Component {
  static propTypes = {
    me: PropTypes.string,
    activeAccount: PropTypes.string,
    messages: PropTypes.array,
  }

  renderMessage = (message) => {
    const { me, activeAccount } = this.props
    let authorCss = ''

    if (message.author === me) {
      authorCss = 'owner'
    } else if (message.author === activeAccount) {
      authorCss = 'active'
    }

    const userIcon = message.author === me ? 'home' : 'person'

    return(
      <div className='ScribbleMessage'>
        <div className='SMAuthor'>
          <span className={authorCss}>
            <FontIcon inherit>{userIcon}</FontIcon>
            {message.author}
          </span> says:
        </div>
        <div className='SMText'>
          <div className='msg-time'>
            <span>{moment(message.createdAt).format('MM/DD/YYYY')}</span>
            <span>{moment(message.createdAt).format('HH:mm:ss')}</span>
          </div>
          <div className={authorCss}>{message.text}</div>
        </div>
      </div>
    )
  }

  render() {
    const { messages } = this.props

    if (!messages) {
      return null
    }

    return(
      <div className='MessageList'>
        {
          messages.map((message) => {
            return <Grid key={message.id}>
              <Cell size={12} align='stretch'>
                { this.renderMessage(message) }
              </Cell>
            </Grid>
          })
        }
      </div>
    )
  }
}
