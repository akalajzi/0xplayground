import React, { Component } from 'react';
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';

import Helmet from 'react-helmet';
import {
  NavigationDrawer,
} from 'react-md';

import Blockchain from 'src/components/blockchain/Blockchain'

import NavLink from './NavLink'
import Title from './Title'

import Home from 'src/components/pages/Home'
import Relayers from 'src/components/pages/Relayers'
import Tokens from 'src/components/pages/Tokens'
import History from 'src/components/pages/History'
import Page from 'src/components/pages/Page'
import NotFoundPage from 'src/components/pages/NotFoundPage'

// ----------------------

const navItems = [
  {
    label: 'Home',
    to: '/',
    exact: true,
    icon: 'home',
  },
  {
    label: 'Relayers',
    to: '/relayers',
    icon: 'settings_input_antenna',
  },
  {
    label: 'Tokens',
    to: '/tokens',
    icon: 'copyright',
  },
  {
    label: 'History',
    to: "/history",
    icon: 'timeline',
  }
]

const styles = {
  content: { minHeight: 'auto' },
}

export default class Main extends Component {
  render() {
    return (
      <div>
        <Helmet
          title="0xrelay.network"
          meta={[{
            name: 'description',
            content: 'Navigating the blockchain',
          }]} />
        <Blockchain />
        <NavigationDrawer
          autoclose
          toolbarTitle={<Title />}
          toolbarThemeType='colored'
          mobileDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
          tabletDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT_MINI}
          desktopDrawerType={NavigationDrawer.DrawerTypes.PERSISTENT}
          navItems={navItems.map(props => <NavLink {...props} key={props.to} />)}
          contentId="main-content"
          contentStyle={styles.content}
          contentClassName="md-grid"
          >
            <Switch key={location.pathname}>
              <Route exact path={navItems[0].to} component={Home} />
              <Route exact path={navItems[1].to} component={Relayers} />
              <Route exact path={navItems[2].to} component={Tokens} />
              <Route exact path={navItems[3].to} component={History} />
              <Route component={NotFoundPage} />
            </Switch>
          </NavigationDrawer>
      </div>
    )
  }
}
