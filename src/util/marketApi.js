import axios from 'axios'

export const HISTORICAL_PRICE_API = 'https://min-api.cryptocompare.com/data/pricehistorical'
// TODO: add app id to calls

export function getFiatValue(fromSymbol, toSymbols = [], timestamp = null ) {
  // TODO: can call only 7 tokens at once, split calls
  // https://min-api.cryptocompare.com/data/pricehistorical?fsym=ZRX&tsyms=USD&ts=1508490121&extraParams=your_app_name
  const tsyms = toSymbols.map((sym) => {
    if (sym.toUpperCase() === 'WETH') {
      return
    } else {
      return sym.toUpperCase()
    }
  })
  const params = {
    fsym: fromSymbol.toUpperCase(),
    tsyms: tsyms.join(','),
    ts: timestamp,
  }
  return axios.get(HISTORICAL_PRICE_API, { params })
}
