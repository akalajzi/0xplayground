import _ from 'lodash'

export const initialState = {
  id: null,
  blockHeight: null,
}

export default function reducer(state, action) {
  let newLogs = null
  let newTrades = null
  switch(action.type) {
    case 'network/RESET':
      return initialState
    case 'network/SET_BLOCK_HEIGHT':
      return { ...state, blockHeight: action.block }
    case 'network/SET_NETWORK':
      return { ...state, id: action.id }
    default:
      return state
  }
}

export function setBlockHeight(block) {
  return { type: 'network/SET_BLOCK_HEIGHT', block }
}

export function setNetwork(id) {
  return { type: 'network/SET_NETWORK', id }
}
