import BigNumber from 'bignumber.js'
import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'
import _ from 'lodash'

export function connectZeroEx(network) {
  const providerEngine = new ProviderEngine()
  providerEngine.addProvider(new FilterSubprovider())
  providerEngine.addProvider(new RpcSubprovider({rpcUrl: network}))
  providerEngine.start()
  return new ZeroEx(providerEngine)
}

// I should probably rewrite this and just use whatever comes out of gql
export function mapTokenList(tokens) {
  if (!tokens) { return null }
  let data = {}
  for (let i=0; i < tokens.length; i++) {
    data[tokens[i].address] = {
      id: tokens[i].id,
      decimals: tokens[i].decimals,
      name: tokens[i].name,
      symbol: tokens[i].symbol,
      address: tokens[i].address,
    }
  }
  return data
}

function normalizeTokenAmount(token, tokenAmount) {
  // TODO: fallback to 1 decimal as default
  const decimals = token ? token.decimals : 1
  return parseInt(tokenAmount) !== 0
    ? new BigNumber(tokenAmount.div(10**decimals)).toDigits(6).toNumber()
    : 0
}

function calculatePrice(maker, taker, inverted = false) {
  const bnMaker = new BigNumber(maker)
  const bnTaker = new BigNumber(taker)
  if (bnMaker.eq(bnTaker)) { // equal amounts
    return new BigNumber(1)
  } else {
    return inverted
      ? bnTaker.div(bnMaker)
      : bnMaker.div(bnTaker)
  }
}
