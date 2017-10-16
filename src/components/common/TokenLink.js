import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import ETH from 'src/const/eth'

class TokenLink extends PureComponent {
  static propTypes = {
    address: PropTypes.string,
  }

  render() {
    const { address, networkId, tokens, style } = this.props
    const token = tokens[address] || null
    const url = ETH.NETWORK_BLOCK_EXPLORER[networkId] + '/address/' + address
    const symbol = token ? token.symbol : '?'

    return(
      <a href={url} target="_blank" style={style}>{symbol}</a>
    )
  }
}

export default connect((state) => {
  return {
    networkId: state.network.id,
    tokens: state.network.tokens,
  }
})(TokenLink)
