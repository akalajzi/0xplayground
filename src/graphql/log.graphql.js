import gql from 'graphql-tag'

const LOG_FRAGMENT = gql`
  fragment LogFragment on Log {
    id
    createdAt
    text
    extra
    type
  }
`

const LOG_LIST_LIMITED = gql`
  query LogMessage {
    allLogs (first: 75, orderBy: createdAt_DESC) {
      ...LogFragment
    }
  }
  ${LOG_FRAGMENT}
`

const CREATE_LOG_QUERY = `
  mutation createLog(
    $text: String!
    $type: String!
    $extra: String
  ) {
    createLog(
      text: $text,
      type: $type,
      extra: $extra,
    ) {
      id
    }
  }
`

const CREATE_LOG = gql(CREATE_LOG_QUERY)

export {
  LOG_LIST_LIMITED,
  CREATE_LOG,
  CREATE_LOG_QUERY,
}
