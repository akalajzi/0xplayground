import _ from 'lodash'

export const initialState = {
  id: null,
  blockHeight: null,
  lastFetchedBlock: null,
  contractAddress: null,
  zrxContractAddress: null,
  tokens: null,
  logs: null,
  latestTrades: [],
}

export default function reducer(state, action) {
  let newLogs = null
  let newTrades = null
  switch(action.type) {
    case 'network/RESET':
      return initialState
    case 'network/SET_BLOCK_HEIGHT':
      return { ...state, blockHeight: action.block }
    case 'network/SET_CONTRACT_ADDRESS':
      return { ...state, contractAddress: action.address }
    case 'network/ADD_LOG':
      newLogs[_.trimStart(action.data.transactionHash, '0x')] = action.data
      return {
        ...state,
        logs: newLogs,
      }
    case 'network/SET_LATEST_TRADES':
      // newTrades = _.concat(state.latestTrades, action.trades)
      newTrades = _.unionBy(state.latestTrades, action.trades, 'transactionHash')
      return {
        ...state,
        latestTrades: newTrades,
      }
    case 'network/SET_LOGS':
      // TODO: No good, fixme
      return {
        ...state,
        logs: action.logs,
        lastFetchedBlock: action.fromBlock,
      }
    case 'network/SET_NETWORK':
      return { ...state, id: action.id }
    case 'network/SET_TIMESTAMP_TRADE':
      newLogs = {...state.logs}
      newLogs[action.blockNumber] = action.trade
      return {
        ...state,
        logs: newLogs,
      }
    case 'network/SET_TOKENS':
      return { ...state, tokens: action.tokens }
    case 'network/SET_ZRX_CONTRACT_ADDRESS':
      return { ...state, zrxContractAddress: action.address }
    default:
      return state
  }
}

export function setBlockHeight(block) {
  return { type: 'network/SET_BLOCK_HEIGHT', block }
}

export function setContractAddress(address) {
  return { type: 'network/SET_CONTRACT_ADDRESS', address}
}

export function addLog(data) {
  console.log('add log data: ', data);
  return null
  return {
    type: 'network/ADD_LOG', data
  }
}

export function setLogs(data) {
  return {
    type: 'network/SET_LOGS',
    logs: data.logs,
    fromBlock: data.fromBlock,
  }
}

export function setLatestTrades(trades) {
  return { type: 'network/SET_LATEST_TRADES', trades }
}

export function setNetwork(id) {
  console.log('setting network!');
  return { type: 'network/SET_NETWORK', id }
}

export function setTimestampOnTrade(data) {
  return {
    type: 'network/SET_TIMESTAMP_TRADE',
    blockNumber: data.blockNumber,
    trade: data.timestampedTrade,
  }
}

export function setTokens(tokens) {
  return { type: 'network/SET_TOKENS', tokens }
}

export function setZrxContractAddress(address) {
  return {type: 'network/SET_ZRX_CONTRACT_ADDRESS', address}
}
