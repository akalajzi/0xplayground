import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'

import ETH from 'src/const/eth'
import css from './Main.scss'

class Title extends PureComponent {
  render() {
    const networkId = this.props.networkId
    const networkName = networkId ? ETH.NETWORK_NAME[networkId] : null

    return(
      <div className={css.headTitle}>
        <div className={css.logo}>
          <Link to='/'><img src='/shrimp-white-40.png' /></Link>
        </div>
        <div className={css.title}><Link to='/'>0x.remote.hr</Link></div>
        {
          networkName
          ? <div className={css.connection}><span>Connected to</span> {networkName.toUpperCase()}</div>
          : <div className={css.connection}>Not connected to network!</div>
        }
      </div>
    )
  }
}

export default connect((state) => {
  return {
    networkId: state.network.id
  }
})(Title)
