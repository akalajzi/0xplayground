import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Button, DialogContainer } from 'react-md'
import { showAddressSearchModal } from 'src/reducers/ui'
import { AccountSearchForm } from 'src/components/common'


class Modals extends Component {
  hide = () => {
    this.props.showAddressSearchModal(false)
  }

  render() {
    const { ui } = this.props

    const addTokenModalActions = [
      { secondary: true, children: 'Cancel', onClick: this.hide },
      <Button flat primary onClick={this.newTokenSubmit}>Confirm</Button>
    ]

    return(
      <DialogContainer
        id='global-modal-dialog'
        visible={ui.showAddressSearchModal}
        onHide={this.hide.bind(this)}
        actions={addTokenModalActions}
        title='Scan Address'
        className='ScanAddressDialog'
        width='500px'
        footerStyle={{ display: 'none'}}
      >
        <AccountSearchForm />
      </DialogContainer>
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
})(Modals)
