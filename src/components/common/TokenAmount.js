import React, { Component } from 'react'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'

import PropTypes from 'prop-types'

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

		if (!token) {
			return <div>?</div>
		}

		const cAmount = amount.div(10**token.decimals)
		const cAmountNormalized = new BigNumber(cAmount).toDigits(6).toNumber()
		const symbol = token.symbol

		return(
			<div>
				{ cAmountNormalized }
				<div>{ symbol }</div>
			</div>
		)
	}
}

export default connect((state) => {
	return {
		tokens: state.network.tokens,
	}
})(TokenAmount)
