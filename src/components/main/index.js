import React, { Component } from 'react';
import Helmet from 'react-helmet';
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';
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
import NotFoundPage from 'src/components/pages/NotFoundPage'
import Scribble from 'src/components/pages/Scribble'
import Edit from 'src/components/pages/Edit'

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
  },
  {
    label: 'Scribble',
    to: '/scribble',
    icon: 'forum',
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
          title="0x.remote.hr"
          meta={[{
            name: 'description',
            content: 'Navigating the blockchain',
          }]}>
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Roboto:400,500,700" />
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-86122143-2"></script>
          <script>
            {`window.dataLayer = window.dataLayer || []
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date())
            gtag('config', 'UA-86122143-2')`}
          </script>
        </Helmet>
        <Blockchain fetchPastTrades />
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
            <Switch>
              <Route exact path={navItems[0].to} component={Home} />
              <Route exact path={navItems[1].to} component={Relayers} />
              <Route exact path={navItems[2].to} component={Tokens} />
              <Route exact path={navItems[3].to} component={History} />
              <Route exact path={navItems[4].to} component={Scribble} />
              <Route exact path='/edit' component={Edit} />
              <Route component={NotFoundPage} />
            </Switch>
          </NavigationDrawer>
      </div>
    )
  }
}
