
export function mapTokenList(tokens) {
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

export function mapLogs(tradeLogs, web3) {
	//  TODO: WRONG! multiple trades possible in the same block
	let data = {}
	const logs = tradeLogs.reverse() 
	for (let i=0; i < logs.length; i++) {
		const trade = logs[i]
		const blockNumber = web3.toDecimal(trade.blockNumber)
		data[blockNumber] = {
			address: trade.address,
			blockNumber: trade.blockNumber,
			transactionHash: trade.transactionHash,
			transactionIndex: trade.transactionIndex,
			blockHash: trade.blockHash,
			removed: trade.removed,
			event: trade.event,
			args: trade.args,
		}
	}

	return data
}
