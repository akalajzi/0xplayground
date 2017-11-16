import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { TextField, Button } from 'react-md'

import { validateEthAddress } from 'src/util/validators'

export default class AccountSearchForm extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      addressInput: '',
      addressInputError: false,
    }
  }

  onAddressChange = (value) => {
    this.setState({ addressInput: value, addressInputError: false })
  }

  submitAddress = () => {
    if (validateEthAddress(this.state.addressInput)) {
      window.location = `/account/${this.state.addressInput}`
    } else {
      this.setState({ addressInputError: true })
    }
  }

  render() {
    const { className, style } = this.props

    let classNames = 'AccountSearchForm'
    if (className) {
      classNames += ` ${className}`
    }

    return (
      <div className={classNames} style={style}>
        <TextField
          id='address-field'
          label='Scan ethereum address'
          lineDirection='left'
          className='address-input'
          onChange={this.onAddressChange}
          error={this.state.addressInputError}
          errorText='Has to be valid ethereum address'
        />
        <Button
          raised
          secondary
          disabled={this.state.addressInputError}
          className='address-input-btn'
          onClick={this.submitAddress}
        >Go</Button>
      </div>
    )
  }
}
