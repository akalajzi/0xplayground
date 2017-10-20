import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'

import { Grid, Cell, Paper, Button, DialogContainer, TextField  } from 'react-md'

import Wallet from 'src/components/wallet/Wallet'

class Admin extends Component {
  constructor(props) {
    super(props)

    this.state = {
      addTokenModalShow: false,
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
    const { newContractAddress, newSymbol, newDecimals } = this.state
    if (newContractAddress.length && newSymbol.length && newDecimals) {
      console.log('We should save this ', this.state);
    }
  }

  onContractAddressChange = (value) => {
    this.setState({newContractAddress: value})
  }

  onSymbolChange = (value) => {
    this.setState({newSymbol: value.toUpperCase()})
  }

  onDecimalsChange = (value) => {
    if (_.isNumber(value)) {
      this.setState({newDecimals: value})
    } else {
      console.error("Not a number!")
    }
  }

  render() {
    const { addTokenModalShow } = this.state
    const addTokenModalActions = [
      { secondary: true, children: 'Cancel', onClick: this.hide },
      <Button flat primary onClick={this.newTokenSubmit}>Confirm</Button>
    ]

    const amMe = this.props.wallet.activeAccount === "0xdc5f5a9c3eb2f16db36c6c7f889f83dd232d71af"

    return (
      <div className="control">
        <Grid>
          <Wallet />
        </Grid>
        {
          amMe
          ? <Grid>
            <Cell align='stretch' size={12}>
              <div className="">
                <Button raised onClick={this.show}>Add Token</Button>
                <DialogContainer
                  id="simple-action-dialog"
                  visible={addTokenModalShow}
                  onHide={this.hide}
                  actions={addTokenModalActions}
                  title="Add Token"
                >
                  <TextField id="token-contract-address" label="Contract Address" onChange={this.onContractAddressChange} />
                  <TextField id="token-symbol" label="Token Symbol" placeholder="TOK" onChange={this.onSymbolChange} value={this.state.newSymbol} />
                  <TextField id="token-decimals" label="Decimals of Precision" defaultValue="18" type='number' onChange={this.onDecimalsChange} />
                </DialogContainer>
              </div>
            </Cell>
          </Grid>
          : <div className="">404 - Not found</div>
        }
      </div>
    )
  }
}

export default connect((state) => {
  return {
    wallet: state.wallet,
  }
}, (dispatch) => {
  return bindActionCreators({
    //,
  }, dispatch)
})(Admin)
