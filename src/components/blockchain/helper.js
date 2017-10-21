import BigNumber from 'bignumber.js'

export function mapTokenList(tokens) {
  if (!tokens) { return null }
  let data = {}
  for (let i=0; i < tokens.length; i++) {
    data[tokens[i].address] = {
      decimals: tokens[i].decimals,
      name: tokens[i].name,
      symbol: tokens[i].symbol,
    }
  }
  return data
}

export function mapLogs(tradeLogs, tokens, web3) {
  //  TODO: WRONG! multiple trades possible in the same block
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

    data[blockNumber] = {
      address: trade.address,
      blockNumber: trade.blockNumber,
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
  // TODO: fallback to 1 decimal as default, figure out a way to know for sure
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
