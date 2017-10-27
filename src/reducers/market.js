export const initialState = {
  error: null,
  currency: 'USD',
  zrxPrice: null,
  ethPrice: null,
  btcPrice: null,
  cryptoMarketcap: null,
  tokenPrices: null,  // tokens that were traded in the last 24 hours
}

export default function reducer(state, action) {
  switch(action.type) {
    case 'market/SET_ERROR':
      return {...state, error: action.error }
    case 'market/SET_ZRX':
      return { ...state, zrxPrice: action.price }
    case 'market/SET_ETH':
      return { ...state, ethPrice: action.price }
    case 'market/SET_MARKET_VALUES':
      return {
        ...state,
        zrxPrice: 1 / action.data[state.currency].ZRX,
        ethPrice: 1 / action.data[state.currency].ETH,
        btcPrice: 1 / action.data[state.currency].BTC,
        error: null,
      }
    case 'market/SET_CURRENCY':
      return { ...state, currency: action.currency, error: null }
    default:
      return state
  }
}

export function setError(error) {
  return { type: 'market/SET_ERROR', error }
}

export function setMarketValues(data) {
  return { type: 'market/SET_MARKET_VALUES', data }
}

export function setZrxPrice(price) {
  return { type: 'market/SET_ZRX', price }
}

export function setEthPrice(price) {
  return { type: 'market/SET_ETH', price }
}

export function setCurrency(currency) {
  return { type: 'market/SET_CURRENCY', currency }
}
