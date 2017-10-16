import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TradesTable from 'src/components/common/TradesTable'

class Home extends Component {
  render() {
    return(
      <div>
        <TradesTable />
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
