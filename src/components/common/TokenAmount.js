import React, { PureComponent } from 'react'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'

import { TokenLink } from 'src/components/common'

export default class TokenAmount extends PureComponent {
  static propTypes = {
    highlight: PropTypes.bool || null,
    showSymbol: PropTypes.bool,
    // amount: PropTypes.object,
    // token: PropTypes.object || null,
  }

  render() {
    const { token, showSymbol, amount, highlight } = this.props
    const decimals = token ? token.decimals : 1
    const cAmount = parseInt(amount) !== 0
      ? new BigNumber(amount).div(10**decimals).toDigits(6).toNumber()
      : 0

    const cssStyle = highlight
      ? { display: 'inline', textDecoration: 'underline', fontWeight: '900' }
      : { display: 'inline' }

    return(
      <div style={cssStyle}>
        { cAmount }
        {
          token
          ? <TokenLink style={{ paddingLeft: '4px' }} token={token} />
          : <span style={{ paddingLeft: '4px' }}>?</span>
        }
      </div>
    )
  }
}
