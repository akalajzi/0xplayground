import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import ETH from 'src/const/eth'

class TokenLink extends PureComponent {
  static propTypes = {
    token: PropTypes.object || null,
    style: PropTypes.object || null,
  }

  render() {
    const { networkId, token, style } = this.props
    const url = ETH.NETWORK_BLOCK_EXPLORER[networkId] + '/address/' + token.address
    const symbol = token ? token.symbol : '?'

    return(
      <a href={url} target="_blank" style={style}>{symbol}</a>
    )
  }
}

export default connect((state) => {
  return {
    networkId: state.network.id,
  }
})(TokenLink)
