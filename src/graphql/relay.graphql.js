import gql from 'graphql-tag'

const RELAY_FRAGMENT = gql`
  fragment RelayFragment on Relay {
    id
    name
    url
    address
    makerFee
    takerFee
  }
`

const RELAY_LIST = gql`
  query Relays {
    allRelays {
      ...RelayFragment
    }
  }
  ${RELAY_FRAGMENT}
`

const CREATE_RELAY_MUTATION = gql`
  mutation createRelay($name: String!, $url: String, $address: String!, $makerFee: String, $takerFee: String) {
    createRelay(name: $name, url: $url, address: $address, makerFee: $makerFee, takerFee: $takerFee) {
      ...RelayFragment
    }
  }
  ${RELAY_FRAGMENT}
`

const DELETE_RELAY_MUTATION = gql`
  mutation deleteRelay($id: ID!) {
    deleteRelay(id: $id) {
      id
    }
  }
`

export {
  RELAY_LIST,
  CREATE_RELAY_MUTATION,
  DELETE_RELAY_MUTATION,
}
