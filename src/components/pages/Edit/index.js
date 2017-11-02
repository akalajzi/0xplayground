import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Grid, Cell } from 'react-md'

import { Wallet } from 'src/components/common'

class Edit extends Component {
  render() {
    const amMe = this.props.wallet.activeAccount === "0xdc5f5a9c3eb2f16db36c6c7f889f83dd232d71af"

    return(
      <div className="control">
        <Wallet />
        { amMe &&
          <Grid>
            <Cell align='stretch' size={12}>
              Hi, its you!
            </Cell>
          </Grid>
        }
      </div>
    )
  }
}

export default connect((state) => {
  return {
    wallet: state.wallet,
  }
})(Edit)
