import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, Cell, Paper } from 'react-md'

import TradesTable from 'src/components/common/TradesTable'
import Wallet from 'src/components/common/Wallet'
import Blockchain from 'src/components/blockchain/Blockchain'


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
            <Paper
              zDepth={2}
              className="papers__example"
            >
              <TradesTable />
            </Paper>
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
