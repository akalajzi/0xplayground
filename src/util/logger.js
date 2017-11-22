import _ from 'lodash'
import api from 'src/const/api'
import { CREATE_LOG_QUERY } from 'src/graphql/log.graphql'

const GraphQLClient = require('graphql-request').GraphQLClient

const graphqlClient = new GraphQLClient(api.graphcool.simple, {
  headers: {
    // Authorization: 'Bearer YOUR_AUTH_TOKEN',
  },
})

export function log(log) {
  if (!_.has(log, 'type')) { log.type = 'Unknown' }
  return graphqlClient.request(CREATE_LOG_QUERY, log)
}
