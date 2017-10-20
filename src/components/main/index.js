import React from 'react';
import { Button, MenuButton, Grid, Cell } from 'react-md';

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
import Blockchain from 'src/components/blockchain/Blockchain'

import Home from 'src/components/pages/Home'
import Page from 'src/components/pages/Page'
import NotFoundPage from 'src/components/pages/NotFoundPage'

// ----------------------

export default () => (
  <div>
    <Helmet
      title="0xplorer"
      meta={[{
        name: 'description',
        content: 'Navigating the blockchain',
      }]} />
    <HeadMenu />
    <Blockchain />

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
      <Route path="/page/:name" component={Page} />
      <Route component={NotFoundPage} />
    </Switch>

  </div>
);
