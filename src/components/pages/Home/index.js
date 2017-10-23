import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, Cell, Paper } from 'react-md'

import Wallet from 'src/components/common/Wallet'
import Blockchain from 'src/components/blockchain/Blockchain'
import Last24HoursStats from './Last24HoursStats'

class Home extends Component {
  render() {
    return(
      <div className="home">
        <Blockchain fetchPastTrades />
        <Grid>
          <Wallet />
        </Grid>
        <Grid>
          <Cell align='stretch' size={12}>
            <Last24HoursStats />
          </Cell>
        </Grid>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    network: state.network
  }
}, (dispatch) => {
  return bindActionCreators({
    //,
  }, dispatch)
})(Home)
