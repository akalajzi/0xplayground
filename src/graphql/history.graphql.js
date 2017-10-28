import gql from 'graphql-tag'

const HISTORY_FRAGMENT = gql`
  fragment HistoryFragment on History {
    id
    timestamp
    startBlockNumber
    endBlockNumber
    zrxUsdPrice
    ethUsdPrice
    tradeVolumeUsd
    feesPaidTotal
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
    $timestamp: Int!,
    $startBlockNumber: String,
    $endBlockNumber: String,
    $zrxUsdPrice: Float,
    $ethUsdPrice: Float,
    $tradeVolumeUsd: Float,
    $feesPaidTotal: Float,
  ) {
      createHistory(
        timestamp: $timestamp,
        startBlockNumber: $startBlockNumber,
        endBlockNumber: $endBlockNumber,
        zrxUsdPrice: $zrxUsdPrice,
        ethUsdPrice: $ethUsdPrice,
        tradeVolumeUsd: $tradeVolumeUsd,
        feesPaidTotal: $feesPaidTotal,
      ) {
        ...HistoryFragment
      }
    }
    ${HISTORY_FRAGMENT}
`

export {
  HISTORY_LIST,
  CREATE_HISTORY_MUTATION,
}
