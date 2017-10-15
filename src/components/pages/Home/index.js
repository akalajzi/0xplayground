import React, { Component } from 'react'
// import Web3 = require('web3')
import Web3 from 'web3'

export default class Home extends Component {
	constructor(props) {
		super(props)
		this.web3 = new Web3()
		this.web3.setProvider(new this.web3.providers.HttpProvider())
	}

	render() {
		console.log("web provider ", this.web3);
		return(
			<div>Home</div>
		)
	}
}
