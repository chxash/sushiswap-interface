import Button from '../../../../components/Button'
import { ChevronLeftIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import TridentLayout from '../../../../layouts/Trident'
import SettingsTab from '../../../../components/Settings'
import Typography from '../../../../components/Typography'
import React, { useEffect } from 'react'
import ModeToggle from '../../../../features/trident/ModeToggle'
import { LiquidityMode } from '../../../../features/trident/types'
import WeightedUnzapMode from '../../../../features/trident/remove/weighted/WeightedUnzapMode'
import WeightedStandardMode from '../../../../features/trident/remove/weighted/WeightedStandardMode'
import { RecoilRoot, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import RemoveTransactionReviewModal from '../../../../features/trident/remove/classic/RemoveTransactionReviewModal'
import { useActiveWeb3React } from '../../../../hooks'
import { useRouter } from 'next/router'
import { poolAtom, slippageAtom } from '../../../../features/trident/remove/classic/context/atoms'
import { liquidityModeAtom, poolBalanceAtom, totalSupplyAtom } from '../../../../features/trident/context/atoms'
import { useCurrency } from '../../../../hooks/Tokens'
import { NATIVE, Percent } from '../../../../../../sushiswap-sdk'
import { SUSHI } from '../../../../config/tokens'
import { useTridentClassicPool } from '../../../../hooks/useTridentClassicPools'
import { useTotalSupply } from '../../../../hooks/useTotalSupply'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { useUserSlippageToleranceWithDefault } from '../../../../state/user/hooks'

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(5, 100)

const RemoveWeighted = () => {
  const { account, chainId } = useActiveWeb3React()
  const { query } = useRouter()
  const { i18n } = useLingui()

  const [[, pool], setPool] = useRecoilState(poolAtom)
  const liquidityMode = useRecoilValue(liquidityModeAtom)
  const setTotalSupply = useSetRecoilState(totalSupplyAtom)
  const setPoolBalance = useSetRecoilState(poolBalanceAtom)
  const setSlippage = useSetRecoilState(slippageAtom)

  const currencyA = useCurrency(query.tokens?.[0]) || NATIVE[chainId]
  const currencyB = useCurrency(query.tokens?.[1]) || SUSHI[chainId]
  const classicPool = useTridentClassicPool(currencyA, currencyB, 50, true)
  const totalSupply = useTotalSupply(classicPool ? classicPool[1]?.liquidityToken : undefined)
  const poolBalance = useTokenBalance(account ?? undefined, classicPool[1]?.liquidityToken)
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE) // custom from users

  useEffect(() => {
    if (!classicPool[1]) return
    setPool(classicPool)
  }, [classicPool, setPool])

  useEffect(() => {
    if (!totalSupply) return
    setTotalSupply(totalSupply)
  }, [setTotalSupply, totalSupply])

  useEffect(() => {
    if (!poolBalance) return
    setPoolBalance(poolBalance)
  }, [poolBalance, setPoolBalance])

  useEffect(() => {
    if (!allowedSlippage) return
    setSlippage(allowedSlippage)
  })

  return (
    <div className="flex flex-col w-full mt-px mb-5">
      <div className="flex flex-col p-5 bg-dark-800 bg-auto bg-bars-pattern bg-opacity-60 gap-4">
        <div className="flex flex-row justify-between">
          <Button
            color="blue"
            variant="outlined"
            size="sm"
            className="rounded-full py-1 pl-2"
            startIcon={<ChevronLeftIcon width={24} height={24} />}
          >
            <Link href={`/trident/pool/weighted/${pool?.token0}/${pool?.token1}`}>{i18n._(t`Back`)}</Link>
          </Button>
          <SettingsTab />
        </div>
        <div className="flex flex-col gap-2">
          <Typography variant="h2" weight={700} className="text-high-emphesis">
            {i18n._(t`Remove Liquidity`)}
          </Typography>
          <Typography variant="sm">
            {i18n._(
              t`Receive both pool tokens directly with Standard mode, or receive total investment as any asset in Zap mode.`
            )}
          </Typography>
        </div>

        {/*spacer*/}
        <div className="h-2" />
      </div>

      {/*TODO ramin*/}
      <ModeToggle onChange={() => {}} />

      <>
        {liquidityMode === LiquidityMode.ZAP && <WeightedUnzapMode />}
        {liquidityMode === LiquidityMode.STANDARD && <WeightedStandardMode />}
      </>

      <RemoveTransactionReviewModal />
    </div>
  )
}

RemoveWeighted.Provider = RecoilRoot
RemoveWeighted.Layout = TridentLayout

export default RemoveWeighted