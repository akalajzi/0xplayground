import React from 'react'

import ETH from 'src/const/eth'

const RelayerLink = ({address, networkId}) => {
  const url = ETH.NETWORK_BLOCK_EXPLORER[networkId] + '/address/' + address
  return(
    <a href={url} target="_blank">{ETH.ZEROEX_RELAY_ADDRESSES[networkId][address]}</a>
  )
}

export default RelayerLink
