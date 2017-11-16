import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import abiDecoder from 'abi-decoder'

import {
  createTransactionListPayload,
  createContractPayload,
  fetchEtherscan,
} from 'src/util/etherscanApi'

// TODO: work in progress
// get the list of only token trades from a wallet with exact inputs and outputs
class EthAccount extends Component {
  static propTypes = {
    address: PropTypes.string, // address we're showing account data for
  }

  componentDidMount() {
    this.fetchTransactionsForAddress(this.props.address)
    // this.test()
  }

  componentDidReceiveProps(nextProps) {
    if (this.props.address !== nextProps.address) {
      this.fetchTransactionsForAddress(nextProps.address)
    }
  }

  fetchTransactionsForAddress = (address) => {
    const payload = createTransactionListPayload(address)
    fetchEtherscan(payload).then((result) => {
      console.log('result ', result.data.result);
      this.parseTransactions(result.data.result)
    }).catch((error) => {
      console.log('error ', error);
    })
  }

  parseTransactions = (transactions) => {
    return transactions.map((item) => {
      if (item.value > 0) { return }
      if (item.input && item.input.length > 75) {
        // probably token transactions
        const method = item.input.slice(0,11)
        if (['0xbc61394a0', '0xa9059cbb0'].indexOf(method) > -1) {
          return
        }
        const contract = item.input.slice(34, 74)
        const trimmedContract = _.trimStart(contract, '0')
        console.log(trimmedContract);
        this.fetchContractAbi(`0x${trimmedContract}`)
        .then((res) => {
          console.log('method', method);
          console.log('res ', res);
          const contractABI = JSON.parse(res.data.result)
          abiDecoder.addABI(contractABI)
          const decodedData = abiDecoder.decodeMethod(item.input)
          console.log('decodedData ', decodedData);
        })
        .catch((error) => {
          console.log('method', method);
          console.log('error fetching contract abi', error);
        })
      }
    })
  }

  fetchContractAbi = (address) => {
    const payload = createContractPayload(address)
    return fetchEtherscan(payload)
  }

  // TODO: create backend endpoint for this
  test = () => {
    const payload = createContractPayload('0xd26114cd6ee289accf82350c8d8487fedb8a0c07')
    fetchEtherscan(payload).then((result) => {
      console.log('c result ', JSON.parse(result.data.result));
      const contractABI = JSON.parse(result.data.result)
      if (contractABI !== '') {
        const theContract = window.web3.eth.contract(contractABI)
        const theContractInstance = theContract.at('0xd26114cd6ee289accf82350c8d8487fedb8a0c07')
        console.log('the Contract ', theContractInstance);
        console.log('name ', theContractInstance.name((err, res) => {console.log(res)}))
        console.log('symbol ', theContractInstance.symbol((err, res) => {console.log(res)}))
        console.log('decimals ', theContractInstance.decimals((err, res) => {console.log(res)}))
      }
    }).catch((error) => {
      console.log('error ', error);
    })
  }

  render() {
    return(
      <div>asdf</div>
    )
  }
}

export default EthAccount
