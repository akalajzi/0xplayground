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

export function mapLog(log, tokens) {
  const makerToken = tokens[log.args.makerToken]
  const takerToken = tokens[log.args.takerToken]
  const filledMakerTokenAmountNormalized = normalizeTokenAmount(makerToken, log.args.filledMakerTokenAmount)
  const filledTakerTokenAmountNormalized = normalizeTokenAmount(takerToken, log.args.filledTakerTokenAmount)
  const price = calculatePrice(log.args.filledMakerTokenAmount, log.args.filledTakerTokenAmount)
    .toDigits(6)
    .toNumber()
  const invertedPrice = calculatePrice(log.args.filledMakerTokenAmount, log.args.filledTakerTokenAmount, true)
    .toDigits(6)
    .toNumber()

  return {
    address: log.address,
    timestamp: log.timestamp,
    blockNumber: log.blockNumber,
    transactionHash: log.transactionHash,
    transactionIndex: log.transactionIndex,
    gasUsed: log.gasUsed || null,
    gasPrice: log.gasPrice || null,
    blockHash: log.blockHash,
    removed: log.removed,
    event: log.event,
    filledMakerTokenAmountNormalized,
    filledTakerTokenAmountNormalized,
    price,
    invertedPrice,
    args: log.args,
  }
}

function normalizeTokenAmount(token, tokenAmount) {
  // TODO: fallback to 1 decimal as default
  const decimals = token ? token.decimals : 1
  return parseInt(tokenAmount) !== 0
    ? new BigNumber(tokenAmount.div(10**decimals)).toDigits(6).toNumber()
    : 0
}

function calculatePrice(maker, taker, inverted = false) {
  if (maker.eq(taker)) { // equal amounts
    return new BigNumber(1)
  } else {
    return inverted
      ? taker.div(maker)
      : maker.div(taker)
  }
}
