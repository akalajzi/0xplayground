const initialState = {
  id: null,
}

export default function reducer(state, action) {
  switch(action.type) {
    case 'RESET':
      return initialState
    case 'SET_NETWORK':
      return { ...state, id: action.id }
    case 'SET_TOKENS':
      return { ...state, tokens: action.tokens }
    default:
      return state;
  }
}

export function setNetwork(id) {
  return {
    type: 'SET_NETWORK',
    id,
  }
}

export function setTokens(tokens) {
  return {
    type: 'SET_TOKENS',
    tokens,
  }
}
