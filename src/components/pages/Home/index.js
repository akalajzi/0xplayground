import React, { Component } from 'react'
// import Web3 = require('web3')
import Web3 from 'web3'

import ProviderEngine from 'web3-provider-engine'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import { ZeroEx } from '0x.js'

import INFURA from 'src/const/infura'
import ETH from 'src/const/eth'

export default class Home extends Component {
	constructor(props) {
		super(props)

		this.state = {
			networkId: null,
		}

		// this.web3 = new Web3()
		// this.web3.setProvider(new this.web3.providers.HttpProvider(INFURA.KOVAN))

		const providerEngine = new ProviderEngine();
		providerEngine.addProvider(new FilterSubprovider());
		providerEngine.addProvider(new RpcSubprovider({rpcUrl: INFURA.KOVAN}));
		providerEngine.start();
		this.zeroEx = new ZeroEx(providerEngine);

	}

	componentDidMount() {
		window.onstorage = function(e) {
		  console.log('The ' + e.key + ' key has been changed from ' + e.oldValue + ' to ' + e.newValue + '.');
		};
		let web3 = window.web3
		if (typeof web3 !== undefined) {
			console.log('not undefined => ', web3);
			window.web3 = new Web3(web3.currentProvider)
		} else {
			console.log('not injected yet...');
			web3 = new Web3()
			web3.setProvider(new web3.providers.HttpProvider(INFURA.KOVAN))
			window.web3 = web3
		}
		this.getNetwork(web3)
		this.fetchStuff()
	}

	fetchStuff = () => {
		this.zeroEx.exchange.getContractAddressAsync()
			.then((address) => {
				return this.zeroEx.tokenRegistry.getTokensAsync()
			})
			.then((tokens) => {
				console.log("got tokens ", tokens);
			})
	}

	getNetwork = (web3) => {
		console.log('get network ', web3, web3.version);
		if (web3.version) {
			web3.version.getNetwork((err, res) => {
				if (err) {
					console.log('Error fetching network version ', err);
				} else {
					console.log('Network Id = ', res);
					this.setState({ networkId: res})
				}
			})
		}

	}

	render() {
		console.log("web provider ", window.web3);
		console.log("zeroEx ", this.zeroEx);
		const networkName = this.state.networkId ? ETH.NETWORKS[this.state.networkId] : null
		return(
			<div>
				{
					networkName &&
					<div>Connected to {networkName}</div>
				}
			</div>
		)
	}
}
