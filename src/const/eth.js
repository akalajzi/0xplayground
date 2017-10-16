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
      "0xa258b39954cef5cb142fd567a46cddb31a670124": "Radar Relay",
      "0xeb71bad396acaa128aeadbc7dbd59ca32263de01": "Kin Alpha",
    },
    42: {},
  },
  REFRESH_RATE: 12,
  TRADE_BATCH_INTERVAL: 86400,
  TRADE_BATCH_BLOCKS: 5000,
}
