import BigNumber from 'bignumber.js'
import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'
import _ from 'lodash'

import api from 'src/const/api'

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

// OBSOLETE
export function mapLogs(tradeLogs, tokens, web3) {
  let data = {}
  const logs = tradeLogs.reverse()
  for (let i=0; i < logs.length; i++) {

    const trade = logs[i]
    const makerToken = tokens[trade.args.makerToken]
    const takerToken = tokens[trade.args.takerToken]
    const blockNumber = web3.toDecimal(trade.blockNumber)

    const filledMakerTokenAmountNormalized = normalizeTokenAmount(makerToken, trade.args.filledMakerTokenAmount)
    const filledTakerTokenAmountNormalized = normalizeTokenAmount(takerToken, trade.args.filledTakerTokenAmount)

    const price = calculatePrice(trade.args.filledMakerTokenAmount, trade.args.filledTakerTokenAmount)
      .toDigits(6)
      .toNumber()
    const invertedPrice = calculatePrice(trade.args.filledMakerTokenAmount, trade.args.filledTakerTokenAmount, true)
      .toDigits(6)
      .toNumber()

    data[_.trimStart(trade.transactionHash, '0x')] = {
      address: trade.address,
      blockNumber: trade.blockNumber,
      blockNumberDecimal: blockNumber,
      transactionHash: trade.transactionHash,
      transactionIndex: trade.transactionIndex,
      blockHash: trade.blockHash,
      removed: trade.removed,
      event: trade.event,
      filledMakerTokenAmountNormalized,
      filledTakerTokenAmountNormalized,
      price,
      invertedPrice,
      args: trade.args,
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
  if (maker.eq(taker)) { // equal amounts
    return new BigNumber(1)
  } else {
    return inverted
      ? taker.div(maker)
      : maker.div(taker)
  }
}

export function getFiatValue(tokenSymbol, amountDecimal, fiatSymbol, timestamp) {
  // https://min-api.cryptocompare.com/data/pricehistorical?fsym=ZRX&tsyms=USD&ts=1508490121&extraParams=your_app_name
  fetch(api.pricehistorical, {
    method: 'GET',
    query: {
      fsym: tokenSymbol.toUpperCase(),
      tsyms: fiatSymbol.toUpperCase(),
      ts: timestamp,
    }
  }).then((response) => {
    const value = response[tokenSymbol][fiatSymbol] * amountDecimal
    return value
  }).catch((error) => {
    return null
  })
}
