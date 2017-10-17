import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Grid, Cell, Paper } from 'react-md'


import TradesTable from 'src/components/common/TradesTable'

class Home extends Component {
  render() {
    return(
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
