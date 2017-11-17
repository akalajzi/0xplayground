import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { FontIcon, ListItem } from 'react-md';
import { showAddressSearchModal } from 'src/reducers/ui'

class AddressSearchNavItem extends PureComponent {
  handleClick = () => {
    this.props.showAddressSearchModal(true)
  }

  render() {
    return(
      <ListItem
        className='NavLink'
        activeClassName='md-text--theme-secondary'
        primaryText='Scan address'
        leftIcon={<FontIcon inherit>search</FontIcon>}
        onClick={this.handleClick.bind(this)}
      />
    )
  }
}

export default connect((state) => {
  return {
    ui: state.ui,
  }
}, (dispatch) => {
  return bindActionCreators({
    showAddressSearchModal,
  }, dispatch)
})(AddressSearchNavItem)
