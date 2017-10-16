import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Paper } from 'react-md'


import TradesTable from 'src/components/common/TradesTable'

class Home extends Component {
  render() {
    return(
      <Paper
        zDepth={1}
        className="papers__example"
      >
        <TradesTable />
      </Paper>
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
