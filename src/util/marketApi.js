import axios from 'axios'

export const HISTORICAL_PRICE_API = 'https://min-api.cryptocompare.com/data/pricehistorical'
// TODO: add app id to calls

export function getFiatValue(tokenSymbol, fiatSymbols = [], timestamp = null ) {
  // https://min-api.cryptocompare.com/data/pricehistorical?fsym=ZRX&tsyms=USD&ts=1508490121&extraParams=your_app_name
  const tsyms = fiatSymbols.map((fiat) => { return fiat.toUpperCase() } )
  const params = {
    fsym: tokenSymbol.toUpperCase(),
    tsyms: tsyms.join(','),
    ts: timestamp,
  }
  return axios.get(HISTORICAL_PRICE_API, { params })
}
