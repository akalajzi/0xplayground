import React, { Component } from 'react';
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';

import Helmet from 'react-helmet';
import {
  Button,
  Drawer,
  NavigationDrawer,
  Toolbar
} from 'react-md';

import NavLink from './NavLink'
import Title from './Title'

import Home from 'src/components/pages/Home'
import Control from 'src/components/pages/Control'
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
    label: 'Control',
    to: '/control',
    icon: 'star',
  },
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
              <Route exact path={navItems[1].to} component={Control} />
              <Route component={NotFoundPage} />
            </Switch>
          </NavigationDrawer>
      </div>
    )
  }
}
