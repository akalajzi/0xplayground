import gql from 'graphql-tag'

import HISTORY_FRAGMENT = gql`
  fragment HistoryFragment on History {
    id
    timestamp
    startBlockNumber
    endBlockNumber
    zrxUsdPrice
    ethUsdPrice
  }
`

const HISTORY_LIST = gql`
  query Histories {
    allHistories {
      ...HistoryFragment
    }
  }
  ${HISTORY_FRAGMENT}
`

const CREATE_HISTORY_MUTATION = gql`
  mutation createHistory(
    $timestamp: DateTime!,
    $startBlockNumber: Int!,
    $endBlockNumber: Int!,
    $zrxUsdPrice: Float,
    $ethUsdPrice: Float) {
      createHistory(
        timestamp: $timestamp,
        startBlockNumber: $startBlockNumber,
        endBlockNumber: $endBlockNumber,
        zrxUsdPrice: $zrxUsdPrice,
        ethUsdPrice: $ethUsdPrice,
      ) {
        ...HistoryFragment
      }
    }
    ${HISTORY_FRAGMENT}
`

export {
  CREATE_HISTORY_MUTATION
}
