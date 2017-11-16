import axios from 'axios'
import _ from 'lodash'

export const ETHERSCAN_API = 'http://api.etherscan.io/api'
export const ETHERSCAN_API_KEY = 'GSE8Z3UJYV6N9XAKFC1F9J8EJ7FN6QA9H2'

export function createTransactionListPayload(address, startblock = 0, endblock = 99999999) {
  return {
    module: 'account',
    action: 'txlist',
    address,
    startblock,
    endblock,
    sort: 'desc',
    apikey: ETHERSCAN_API_KEY,
  }
}

export function createTokenBalanceCheckPayload(contractAddress, address) {
  return {
    module: 'account',
    action: 'tokenbalance',
    contractAddress,
    address,
    tag: 'latest',
    apikey: ETHERSCAN_API_KEY,
  }
}

export function createContractPayload(contractAddress) {
  return {
    module: 'contract',
    action: 'getabi',
    address: contractAddress,
  }
}

export function fetchEtherscan(params) {
  return axios.get(ETHERSCAN_API, { params })
}
