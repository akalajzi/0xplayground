import React, { Component } from 'react'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'

import TokenLink from 'src/components/common/TokenLink'

class TokenAmount extends Component {
  static propTypes = {
    tokens: PropTypes.object || null,
    showSymbol: PropTypes.bool,
    amount: PropTypes.object,
    tokenAddress: PropTypes.string,
  }

  render() {
    const { tokens, showSymbol, amount, tokenAddress } = this.props
    const token = tokens[tokenAddress] || null
    // TODO: fallback to 18 decimals as default, figure out a way to know for sure
    const decimals = token ? token.decimals : 1

    const cAmount = parseInt(amount) !== 0
      ? new BigNumber(amount.div(10**decimals)).toDigits(6).toNumber()
      : 0

    return(
      <div style={{ display: 'inline' }}>
        { cAmount }
        {
          token
          ? <TokenLink style={{ paddingLeft: '4px' }} address={tokenAddress} />
          : <span style={{ paddingLeft: '4px' }}>?</span>
        }
      </div>
    )
  }
}

export default connect((state) => {
  return {
    tokens: state.network.tokens,
  }
})(TokenAmount)
