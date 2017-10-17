export const initialState = {
  networkId: null,
  activeAccount: null,
}

export default function reducer(state, action) {
  switch(action.type) {
    case 'wallet/RESET':
      return initialState
    case 'wallet/SET_ACTIVE_ADDRESS':
      return { ...state, activeAccount: action.address }
    case 'wallet/SET_NETWORK':
      return { ...state, networkId: action.id }
    default:
      return state
  }
}

export function setActiveAccount(address) {
  return { type: 'wallet/SET_ACTIVE_ADDRESS', address }
}

export function setNetwork(id) {
  return { type: 'wallet/SET_NETWORK', id }
}
