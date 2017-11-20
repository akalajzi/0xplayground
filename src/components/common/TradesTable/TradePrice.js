import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'

import { Tooltipped } from 'src/components/common'

export default class TradePrice extends PureComponent {
  static propTypes = {
    trade: PropTypes.object.isRequired,
    tokens: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      inverted: false,
    }
  }

  invert = () => {
    const inverted = !this.state.inverted
    this.setState({ inverted })
  }

  calculatePrice = (trade) => {
    const makerTokenDecimals = this.props.tokens[trade.makerToken].decimals
    const makerAmount = new BigNumber(trade.filledMakerTokenAmount).div(10**makerTokenDecimals).toNumber()
    const takerTokenDecimals = this.props.tokens[trade.takerToken].decimals
    const takerAmount = new BigNumber(trade.filledTakerTokenAmount).div(10**takerTokenDecimals).toNumber()
    return new BigNumber(makerAmount / takerAmount).toDigits(6).toNumber()
  }

  calculateInvertedPrice = (price) => {
    if (price && price !== 0) {
      return new BigNumber(1 / price).toDigits(6).toNumber()
    } else {
      return '-'
    }
  }

  render() {
    const { trade, tokens } = this.props
    const price = this.calculatePrice(trade)
    const invertedPrice = this.calculateInvertedPrice(price)

    return(
      <div onClick={ this.invert.bind(this) }>
        <Tooltipped
          tooltipLabel='Click to invert the price'
          tooltipPosition='top'
          className='pointer'
          >
          {
            this.state.inverted
            ? <span className='inverted'>{ invertedPrice }</span>
            : price
          }
        </Tooltipped>
      </div>
    )
  }
}
