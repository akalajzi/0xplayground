import React, { Component } from 'react'
import { connect } from 'react-redux'

import ETH from 'src/const/eth'

import {
  DataTable,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
} from 'react-md';

import TokenAmount from 'src/components/common/TokenAmount'

class TradesTable extends Component {
	render() {
		const { logs, tokens } = this.props
		return(
			<DataTable plain>
				<TableHeader>
					<TableRow>
						<TableColumn>Time</TableColumn>
						<TableColumn>Trade</TableColumn>
						<TableColumn>Price</TableColumn>
						<TableColumn>Relay</TableColumn>
						<TableColumn>Maker Fee</TableColumn>
						<TableColumn>Taker Fee</TableColumn>
					</TableRow>
				</TableHeader>
				<TableBody>
					{
						logs && logs.map((trade, i) => {
							return (
								<TableRow key={i}>
									<TableColumn>timestamp</TableColumn>
									<TableColumn>

									</TableColumn>
									<TableColumn></TableColumn>
									<TableColumn>
										{ ETH.ZEROEX_RELAY_ADDRESSES[this.props.networkId][trade.args.feeRecipient] || 'Unknown' }
									</TableColumn>
									<TableColumn>
										<TokenAmount
											showSymbol
											amount={trade.args.paidMakerFee}
											tokenAddress={trade.args.makerToken}
										/>
									</TableColumn>
									<TableColumn>
										<TokenAmount
											showSymbol
											amount={trade.args.paidTakerFee}
											tokenAddress={trade.args.takerToken}
										/>
									</TableColumn>
								</TableRow>
							)
						})
					}
				</TableBody>
			</DataTable>
		)
	}
}

export default connect((state) => {
	return {
		networkId: state.network.id,
		logs: state.network.logs,
		tokens: state.network.tokens,
	}
})(TradesTable)
