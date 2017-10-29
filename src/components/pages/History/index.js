import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, Cell } from 'react-md'

import Blockchain from 'src/components/blockchain/Blockchain'
import { CellTitle, TradesTable } from 'src/components/common'

class History extends Component {
  render() {
    return (
      <div className="history">
        <Grid>
          <Cell align='stretch' size={12}>
            <CellTitle title='Token History' />
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
