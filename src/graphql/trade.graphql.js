import gql from 'graphql-tag'

const TRADE_FRAGMENT = gql`
  fragment TradeFragment on Trade {
    id
    address
    timestamp
    blockNumber
    transactionHash
    transactionIndex
    gasUsed
    gasPrice
    blockHash
    event
    removed
    filledMakerTokenAmountNormalized
    filledTakerTokenAmountNormalized
    price
    invertedPrice
    filledMakerTokenAmount
    filledTakerTokenAmount
    maker
    taker
    makerToken
    takerToken
    paidMakerFee
    paidTakerFee
    feeRecipient
    tokens
    orderHash
  }
`

const TRADE_LIST = gql`
  query Trade {
    allTrades (first: 100, orderBy: timestamp_DESC) {
      ...TradeFragment
    }
  }
  ${TRADE_FRAGMENT}
`

const MY_TRADE_LIST = gql`
  query Trade ($address: String) {
    allTrades (
      filter: {
        OR: [
          { taker: $address },
          { maker: $address }
        ]
      },
      first: 100,
      orderBy: timestamp_DESC
    ) {
      ...TradeFragment
    }
  }
  ${TRADE_FRAGMENT}
`

export {
  TRADE_LIST,
  MY_TRADE_LIST,
}
