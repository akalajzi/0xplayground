import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Home extends Component {
  render() {
    return(
      <div>
        asdf
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
