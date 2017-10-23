import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, Cell } from 'react-md'

import Blockchain from 'src/components/blockchain/Blockchain'
import TradesTable from 'src/components/common/TradesTable'

class History extends Component {
  render() {
    return (
      <div className="history">
        <h1>History</h1>
        <Grid>
          <Cell align='stretch' size={12}>
            <Blockchain fetchPastTrades />
            <TradesTable />
          </Cell>
        </Grid>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    //
  }
}, (dispatch) => {
  return bindActionCreators({
    //,
  }, dispatch)
})(History)
