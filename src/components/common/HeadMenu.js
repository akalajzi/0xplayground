import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Toolbar, Button, MenuButton } from 'react-md'
import ETH from 'src/const/eth'

import css from './HeadMenu.scss'

class HeadMenu extends Component {
  render() {
    return (
      <Toolbar
        colored
        nav={<Button icon>menu</Button>}
        title={<Title networkId={this.props.network.id} />}
        actions={<MenuButton
          id={'kebab-menu-toolbar'}
          icon
          menuItems={['Settings', 'Help']}
        >
          more_vert
        </MenuButton>}
      />
    )
  }
}

export default connect((state) => {
  return {
    network: state.network
  }
})(HeadMenu)

const Title = (props) => {
  const networkName = props.networkId ? ETH.NETWORK_NAME[props.networkId] : null
  return (
    <div className={css.headTitle}>
      <div className={css.title}>0xrelay.network</div>
      {
        networkName
        ? <div className={css.connection}><span>Connected to</span> {networkName.toUpperCase()}</div>
        : <div className={css.connection}>Not connected to network!</div>
      }
    </div>
  )
}

const NavButton = () => {
  return(
    <Button icon>menu</Button>
  )
}

const Actions = () => {
  return(
    <MenuButton
      id={'kebab-menu-toolbar'}
      icon
      menuItems={['Settings', 'Help']}
    >
      more_vert
    </MenuButton>
  )
}
