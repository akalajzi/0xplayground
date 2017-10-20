import React, { Component } from 'react';
import { Button, Drawer, Toolbar } from 'react-md';

// Routing via React Router
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';

import Helmet from 'react-helmet';
import {ZeroEx} from '0x.js'

// Get the ReactQL logo.  This is a local .svg file, which will be made
// available as a string relative to [root]/dist/assets/img/
// import logo from './reactql-logo.svg';

import HeadMenu from 'src/components/common/HeadMenu'

import Home from 'src/components/pages/Home'
import Control from 'src/components/pages/Control'
import Page from 'src/components/pages/Page'
import NotFoundPage from 'src/components/pages/NotFoundPage'

// ----------------------

export default class Main extends Component {
  constructor(props) {
    super(props)

    this.state = {
      drawerVisible: false,
    }
  }

  openDrawer = () => {
    this.setState({ drawerVisible: true })
  }

  closeDrawer = () => {
    this.setState({ drawerVisible: false })
  }

  handleVisibilityChange = (drawerVisible) => {
    this.setState({ drawerVisible })
  }

  render() {
    return (
      <div>
        <Helmet
          title="0xrelay.network"
          meta={[{
            name: 'description',
            content: 'Navigating the blockchain',
          }]} />
        <HeadMenu onNavClick={this.openDrawer} />
        <Drawer
          id="main-drawer"
          autoclose
          defaultVisible={false}
          clickableDesktopOverlay
          defaultMedia='desktop'
          visible={this.state.drawerVisible}
          onVisibilityChange={this.handleVisibilityChange}
          navItems={[
            <Link to="/"><Button flat>Home</Button></Link>,
            <Link to="/control"><Button flat>Control</Button></Link>
          ]}
          header={(
            <Toolbar
              colored
              nav={null}
              actions={<Button icon onClick={this.closeDrawer}>arrow_back</Button>}
              className="md-divider-border md-divider-border--bottom"
            />
          )}
        />

        {/*
          <GraphQLMessage />
          <hr />
          <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/page/about">About</Link></li>
          <li><Link to="/page/contact">Contact</Link></li>
          <li><Link to="/old/path">Redirect from /old/path &#8594; /new/path</Link></li>
        </ul>
        <hr /> */}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/control" component={Control} />
          <Route path="/page/:name" component={Page} />
          <Route component={NotFoundPage} />
        </Switch>

      </div>
    )
  }
}
