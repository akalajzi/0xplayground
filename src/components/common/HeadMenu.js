import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Toolbar, Button, MenuButton } from 'react-md'
import ETH from 'src/const/eth'

import css from './HeadMenu.scss'

class HeadMenu extends Component {
  render() {
    // const headActions = [<MenuButton
    //     id={'kebab-menu-toolbar'}
    //     icon
    //     menuItems={['Settings', 'Help']}
    //   >
    //     more_vert
    //   </MenuButton>]

    return (
      <Toolbar
        colored
        nav={<Button icon onClick={this.props.onNavClick}>menu</Button>}
        title={<Title networkId={this.props.network.id} />}
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
      <div className={css.logo}>
        <img src='/shrimp-white-40.png' />
      </div>
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
