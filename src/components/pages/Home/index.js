import React, { Component } from 'react'
// import Web3 = require('web3')
import Web3 from 'web3'

import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'

import INFURA from 'src/const/infura'

export default class Home extends Component {
	constructor(props) {
		super(props)
		this.web3 = new Web3()
		this.web3.setProvider(new this.web3.providers.HttpProvider(INFURA.KOVAN))

		const providerEngine = new ProviderEngine();
		providerEngine.addProvider(new FilterSubprovider());
		providerEngine.addProvider(new RpcSubprovider({rpcUrl: INFURA.KOVAN}));
		providerEngine.start();
		this.zeroEx = new ZeroEx(providerEngine);
	}

	render() {
		console.log("web provider ", this.web3);
		console.log("zeroEx ", this.zeroEx);
		return(
			<div>Home</div>
		)
	}
}
