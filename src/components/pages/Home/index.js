import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ETH from 'src/const/eth'

class Home extends Component {
  render() {
    const { network } = this.props
    const networkName = network ? ETH.NETWORKS[network.id] : null
    return(
      <div>
        {
          networkName &&
          <div>Connected to {networkName}</div>
        }
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
