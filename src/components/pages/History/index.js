import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, Cell } from 'react-md'


class History extends Component {
  render() {
    return (
      <div className="history">
        <h1>History</h1>
        <Grid>
          <Cell align='stretch' size={12}>

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
