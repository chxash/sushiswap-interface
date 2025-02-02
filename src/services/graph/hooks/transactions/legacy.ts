import { Transactions } from 'app/features/transactions/types'
import { formatDateAgo, formatNumber } from 'app/functions'
import { useMemo } from 'react'
import { getTransactions } from 'app/services/graph/fetchers'
import { useActiveWeb3React } from 'app/services/web3'
import useSWR from 'swr'

export interface LegacyTransactions {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  id: string
  pair: {
    token0: {
      symbol: string
    }
    token1: {
      symbol: string
    }
  }
  sender: string
  timestamp: string
  to: string
}

export const legacyTransactionDataFormatter = (rawData: LegacyTransactions[]): Transactions[] => {
  return rawData.map((tx) => {
    const props =
      tx.amount0In === '0'
        ? {
            type: `Swap ${tx.pair.token1.symbol} for ${tx.pair.token0.symbol}`,
            incomingAmt: `${formatNumber(tx.amount1In)} ${tx.pair.token1.symbol}`,
            outgoingAmt: `${formatNumber(tx.amount0Out)} ${tx.pair.token0.symbol}`,
          }
        : {
            type: `Swap ${tx.pair.token0.symbol} for ${tx.pair.token1.symbol}`,
            incomingAmt: `${formatNumber(tx.amount0In)} ${tx.pair.token0.symbol}`,
            outgoingAmt: `${formatNumber(tx.amount1Out)} ${tx.pair.token1.symbol}`,
          }
    return {
      value: formatNumber(tx.amountUSD, true),
      address: tx.to,
      time: formatDateAgo(new Date(Number(tx.timestamp) * 1000)),
      ...props,
    }
  })
}
export const useLegacyTransactions = (pairs?: string[]) => {
  const { chainId } = useActiveWeb3React()
  const variables = { where: { pair_in: pairs } }
  const { data, error, isValidating } = useSWR<LegacyTransactions[]>(
    !!chainId && !!pairs ? ['legacyTransactions', chainId, JSON.stringify(variables)] : null,
    () => getTransactions(chainId, variables)
  )
  const transactions = useMemo(() => legacyTransactionDataFormatter(data || []), [data])
  return { transactions, error, loading: isValidating }
}
