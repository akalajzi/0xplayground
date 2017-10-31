import gql from 'graphql-tag'

const SCRIBBLE_FRAGMENT = gql`
  fragment ScribbleFragment on ScribbleMessage {
    id
    createdAt
    text
    author
  }
`

const SCRIBBLE_LIST_LIMITED = gql`
  query ScribbleMessage {
    allScribbleMessages (first: 50, orderBy: createdAt_DESC) {
      ...ScribbleFragment
    }
  }
  ${SCRIBBLE_FRAGMENT}
`

const CREATE_SCRIBBLE_MESSAGE = gql`
  mutation createScribbleMessage(
    $text: String!
    $author: String!
  ) {
    createScribbleMessage(
      text: $text,
      author: $author,
    ) {
      ...ScribbleFragment
    }
  }
  ${SCRIBBLE_FRAGMENT}
`

export {
  SCRIBBLE_LIST_LIMITED,
  CREATE_SCRIBBLE_MESSAGE,
}
