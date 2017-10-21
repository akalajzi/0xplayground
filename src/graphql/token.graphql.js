import gql from 'graphql-tag'

const TOKEN_FRAGMENT = gql`
  fragment TokenFragment on Token {
    id
    name
    symbol
    address
    decimals
  }
`

const TOKEN_LIST_QUERY = gql`
  query Tokens {
    allTokens {
      ...TokenFragment
    }
  }
  ${TOKEN_FRAGMENT}
`

const CREATE_TOKEN_MUTATION = gql`
  mutation createToken($name: String!, $symbol: String, $address: String!, $decimals: Int!) {
    createToken(name: $name, symbol: $symbol, address: $address, decimals: $decimals) {
      ...TokenFragment
    }
  }
  ${TOKEN_FRAGMENT}
`

const DELETE_TOKEN_MUTATION = gql`
  mutation deleteToken($id: ID!) {
    deleteToken(id: $id) {
      id
      address
    }
  }
`

export {
  TOKEN_LIST_QUERY,
  CREATE_TOKEN_MUTATION,
  DELETE_TOKEN_MUTATION,
}
