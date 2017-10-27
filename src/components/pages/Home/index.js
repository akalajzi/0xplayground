import React, { Component } from 'react'
import { Grid, Cell } from 'react-md'

import Wallet from 'src/components/common/Wallet'
import Last24HoursStats from './Last24HoursStats'

export default class Home extends Component {
  render() {
    return(
      <div className="home">
        <Grid>
          <Wallet />
        </Grid>
        <Grid>
          <Cell align='stretch' size={12}>
            <Last24HoursStats />
          </Cell>
        </Grid>
      </div>
    )
  }
}
