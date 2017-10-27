import axios from 'axios'
import _ from 'lodash'

export const HISTORICAL_PRICE_API = 'https://min-api.cryptocompare.com/data/pricehistorical'
// TODO: add app id to calls

export function getFiatValue(fromSymbol, toSymbols = [], timestamp = null ) {
  if (toSymbols.length > 6) {
    const sChunks = _.chunk(toSymbols, 6)
    return Promise.all(
      sChunks.map((chunk) => {
        return fetchPrices(fromSymbol, chunk, timestamp)
      })
    )
  } else {
    return fetchPrices(fromSymbol, toSymbols, timestamp)
  }
}

export function fetchPrices(fromSymbol, toSymbols = [], timestamp = null) {
  // https://min-api.cryptocompare.com/data/pricehistorical?fsym=ZRX&tsyms=USD&ts=1508490121&extraParams=your_app_name
  const tsyms = toSymbols.map((sym) => {
    if (sym.toUpperCase() === 'WETH') {
      return "ETH"
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
