export const initialState = {
  id: null,
  blockHeight: null,
  lastFetchedBlock: null,
  contractAddress: null,
  zrxContractAddress: null,
  tokens: null,
  logs: null,
}

export default function reducer(state, action) {
  switch(action.type) {
    case 'network/RESET':
      return initialState
    case 'network/SET_BLOCK_HEIGHT':
      return { ...state, blockHeight: action.block }
    case 'network/SET_CONTRACT_ADDRESS':
      return { ...state, contractAddress: action.address }
    case 'network/SET_LOGS':
      return {
        ...state,
        logs: action.logs,
        lastFetchedBlock: action.fromBlock,
      }
    case 'network/SET_NETWORK':
      return { ...state, id: action.id }
    case 'network/SET_TIMESTAMP_TRADE':
      const newLogs = {...state.logs}
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

export function setLogs(data) {
  return {
    type: 'network/SET_LOGS',
    logs: data.logs,
    fromBlock: data.fromBlock,
  }
}

export function setNetwork(id) {
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
