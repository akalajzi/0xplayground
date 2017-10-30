import gql from 'graphql-tag'

const TRADES_FRAGMENT = gql`
  fragment TradesFragment on Trades {
    id
    address
    timestamp
    blockNumber
    transactionHash
    transactionIndex
    blockHash
    event
    removed
    filledMakerTokenAmountNormalized
    filledTakerTokenAmountNormalized
    price
    invertedPrice
    args
  }
`

const TRADES_LIST = gql`
  query Trades {
    allTradeses (first: 100, orderBy: timestamp_DESC) {
      ...TradesFragment
    }
  }
  ${TRADES_FRAGMENT}
`

export {
  TRADES_LIST,
}
