import { ChainId } from '@sushiswap/core-sdk'
import { GRAPH_HOST } from 'app/services/graph/constants'
import { barHistoriesQuery, barQuery } from 'app/services/graph/queries/bar'
import { request } from 'graphql-request'

const BAR = {
  [ChainId.ETHEREUM]: 'matthewlilley/bar',
}

const fetcher = async (query, variables = undefined) =>
  request(`${GRAPH_HOST[ChainId.ETHEREUM]}/subgraphs/name/${BAR[ChainId.ETHEREUM]}`, query, variables)

export const getBar = async (variables = undefined) => {
  const { bar } = await fetcher(barQuery, variables)
  return bar
}

export const getBarHistory = async (variables = undefined) => {
  const { histories } = await fetcher(barHistoriesQuery, variables)
  return histories
}
