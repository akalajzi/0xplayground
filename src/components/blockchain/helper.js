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
