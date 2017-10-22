export default {
  NETWORK_NAME: {
    1: 'Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    42: 'Kovan',
  },
  NETWORK_BLOCK_EXPLORER: {
    1: "https://etherscan.io",
    3: "https://ropsten.etherscan.io",
    4: "https://rinkeby.etherscan.io",
    42: "https://kovan.etherscan.io",
  },
  ZEROEX_RELAY_ADDRESSES: {
    1: {
      '0x0000000000000000000000000000000000000000': 'OTC',
      '0xa258b39954cef5cb142fd567a46cddb31a670124': 'Radar Relay',
      '0xeb71bad396acaa128aeadbc7dbd59ca32263de01': 'Kin Alpha',
      '0xc22d5b2951db72b44cfb8089bb8cd374a3c354ea': 'OpenRelay',
    },
    42: {},
  },
  REFRESH_RATE: 12,
  TRADE_BATCH_INTERVAL: 86400,
  TRADE_BATCH_BLOCKS: 10000,
}
