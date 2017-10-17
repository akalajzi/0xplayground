const initialState = {
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
    case 'RESET':
      return initialState
    case 'SET_BLOCK_HEIGHT':
      return { ...state, blockHeight: action.block }
    case 'SET_CONTRACT_ADDRESS':
      return { ...state, contractAddress: action.address }
    case 'SET_LOGS':
      return {
        ...state,
        logs: action.logs,
        lastFetchedBlock: action.fromBlock,
      }
    case 'SET_NETWORK':
      return { ...state, id: action.id }
    case 'SET_TIMESTAMP_TRADE':
      const newLogs = {...state.logs}
      newLogs[action.blockNumber] = action.trade
      return {
        ...state,
        logs: newLogs,
      }
    case 'SET_TOKENS':
      return { ...state, tokens: action.tokens }
    case 'SET_ZRX_CONTRACT_ADDRESS':
      return { ...state, zrxContractAddress: action.address }
    default:
      return state;
  }
}

export function setBlockHeight(block) {
  return { type: 'SET_BLOCK_HEIGHT', block }
}

export function setContractAddress(address) {
  return { type: 'SET_CONTRACT_ADDRESS', address}
}

export function setLogs(data) {
  return {
    type: 'SET_LOGS',
    logs: data.logs,
    fromBlock: data.fromBlock,
  }
}

export function setNetwork(id) {
  return { type: 'SET_NETWORK', id }
}

export function setTimestampOnTrade(data) {
  return {
    type: 'SET_TIMESTAMP_TRADE',
    blockNumber: data.blockNumber,
    trade: data.timestampedTrade,
  }
}

export function setTokens(tokens) {
  return { type: 'SET_TOKENS', tokens }
}

export function setZrxContractAddress(address) {
  return {type: 'SET_ZRX_CONTRACT_ADDRESS', address}
}
