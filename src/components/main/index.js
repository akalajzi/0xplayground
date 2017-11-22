import React, { Component } from 'react'
import Helmet from 'react-helmet'
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom'
import {
  Cell,
  Grid,
  NavigationDrawer,
} from 'react-md'

import Base from 'src/components/blockchain/Base'
import NavLink from './NavLink'
import AddressSearchNavItem from './customNavItems/AddressSearchNavItem'
import Title from './Title'
import Modals from './Modals'
import { Wallet, FlyingMessage } from 'src/components/common'

import Home from 'src/components/pages/Home'
import Relayers from 'src/components/pages/Relayers'
import Tokens from 'src/components/pages/Tokens'
import History from 'src/components/pages/History'
import NotFoundPage from 'src/components/pages/NotFoundPage'
import Scribble from 'src/components/pages/Scribble'
import Edit from 'src/components/pages/Edit'
import MyTrades from 'src/components/pages/MyTrades'

// ----------------------

const navItems = [
  {
    label: 'Home',
    to: '/',
    exact: true,
    icon: 'home',
  },
  {
    component: <AddressSearchNavItem key='address-search-nav-item' />,
  },
  {
    label: 'My Trades',
    to: '/account',
    exact: true,
    icon: 'account_balance',
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
    const navItemsApplied = navItems.map((props) => {
      if (props.component) {
        return props.component
      } else {
        return <NavLink {...props} key={props.to} />
      }
    })

    return (
      <div>
        <Helmet
          title='0x.remote.hr'
          meta={[{
            name: 'description',
            content: 'Navigating the blockchain',
          }]}>
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons|Roboto:400,500,700" />
          <script key='gta' async src="https://www.googletagmanager.com/gtag/js?id=UA-86122143-2"></script>
          <script key='gtb'>
            {`window.dataLayer = window.dataLayer || []
            function gtag(){dataLayer.push(arguments)}
            gtag('js', new Date())
            gtag('config', 'UA-86122143-2')`}
          </script>
        </Helmet>
        <Base />
        <NavigationDrawer
          autoclose
          toolbarTitle={<Title />}
          toolbarActions={<Wallet />}
          toolbarThemeType='colored'
          mobileDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
          tabletDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
          desktopDrawerType={NavigationDrawer.DrawerTypes.TEMPORARY_MINI}
          drawerClassName='DrawerList'
          navItems={ navItemsApplied }
          contentId='main-content'
          contentStyle={styles.content}
          contentClassName='md-grid'
          >
            <div className='main-wrapper'>
              <Grid>
                <Cell size={12} align='stretch'>
                  <FlyingMessage left>
                    <div className='light-grey'>
                      Tips welcome in ETH or any ERC20 token<br />
                      0xdc5f5a9c3eb2f16db36c6c7f889f83dd232d71af
                    </div>
                  </FlyingMessage>
                  <FlyingMessage right className='hideOnMobile'>
                    <div>
                      Have a suggestion?<br />
                      <Link to='/scribble'>Tell me about it!</Link>
                    </div>
                  </FlyingMessage>
                </Cell>
              </Grid>
              <Modals />
              <Switch>
                <Route exact path={navItems[0].to} component={Home} />
                <Route exact path={navItems[2].to} component={MyTrades} />
                <Route path={`${navItems[2].to}/:address`} component={MyTrades} />
                <Route exact path={navItems[3].to} component={Relayers} />
                <Route exact path={navItems[4].to} component={Tokens} />
                <Route exact path={navItems[5].to} component={History} />
                <Route exact path={navItems[6].to} component={Scribble} />
                <Route exact path='/edit' component={Edit} />
                <Route component={NotFoundPage} />
              </Switch>
            </div>
          </NavigationDrawer>
      </div>
    )
  }
}
