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

// NotFound 404 handler for unknown routes
import { Redirect } from 'kit/lib/routing';

// import GraphQLMessage from 'src/components/graphql';
// import ReduxCounter from 'src/components/redux';
// import Stats from 'src/components/stats';

// Get the ReactQL logo.  This is a local .svg file, which will be made
// available as a string relative to [root]/dist/assets/img/
// import logo from './reactql-logo.svg';

import HeadMenu from 'src/components/common/HeadMenu'
import Blockchain from 'src/components/Blockchain'

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

    {/* <Grid className="grid-example">
      <Cell size={6} tabletSize={8}>6 (8 tablet)</Cell>
      <Cell size={4} tabletSize={6}>4 (6 tablet)</Cell>
      <Cell size={2} phoneSize={4}>2 (4 phone)</Cell>
    </Grid>
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
    {/* <hr />
    <ReduxCounter />
    <hr />
    <p>Runtime info:</p>
    <Stats /> */}
  </div>
);
