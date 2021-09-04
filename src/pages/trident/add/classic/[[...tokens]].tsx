import React, { useEffect } from 'react'
import { RecoilRoot, useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  currenciesAtom,
  liquidityModeAtom,
  poolBalanceAtom,
  totalSupplyAtom,
} from '../../../../features/trident/context/atoms'
import {
  mainInputAtom,
  poolAtom,
  secondaryInputSelector,
  zapInputAtom,
} from '../../../../features/trident/add/classic/context/atoms'

import AddTransactionReviewModalStandard from '../../../../features/trident/add/classic/AddTransactionReviewModal'
import Button from '../../../../components/Button'
import { ChevronLeftIcon } from '@heroicons/react/solid'
import ClassicStandardMode from '../../../../features/trident/add/classic/ClassicStandardMode'
import ClassicZapMode from '../../../../features/trident/add/classic/ClassicZapMode'
import DepositSettingsModal from '../../../../features/trident/add/classic/DepositSettingsModal'
import FixedRatioHeader from '../../../../features/trident/add/FixedRatioHeader'
import Link from 'next/link'
import { LiquidityMode } from '../../../../features/trident/types'
import ModeToggle from '../../../../features/trident/ModeToggle'
import { NATIVE } from '@sushiswap/sdk'
import { SUSHI } from '../../../../config/tokens'
import SettingsTab from '../../../../components/Settings'
import TridentLayout from '../../../../layouts/Trident'
import Typography from '../../../../components/Typography'
import { t } from '@lingui/macro'
import { toHref } from '../../../../hooks/useTridentPools'
import { useActiveWeb3React } from '../../../../hooks'
import { useCurrency } from '../../../../hooks/Tokens'
import { useLingui } from '@lingui/react'
import { useRouter } from 'next/router'
import { useTokenBalance } from '../../../../state/wallet/hooks'
import { useTotalSupply } from '../../../../hooks/useTotalSupply'
import { useTridentClassicPool } from '../../../../hooks/useTridentClassicPools'

const AddClassic = () => {
  const { account, chainId } = useActiveWeb3React()
  const { query } = useRouter()
  const { i18n } = useLingui()

  const [[, pool], setPool] = useRecoilState(poolAtom)
  const liquidityMode = useRecoilValue(liquidityModeAtom)
  const [currencies, setCurrencies] = useRecoilState(currenciesAtom)
  const setTotalSupply = useSetRecoilState(totalSupplyAtom)
  const setPoolBalance = useSetRecoilState(poolBalanceAtom)

  const currencyA = useCurrency(query.tokens?.[0]) || NATIVE[chainId]
  const currencyB = useCurrency(query.tokens?.[1]) || SUSHI[chainId]
  const classicPool = useTridentClassicPool(currencyA, currencyB, 50, true)
  const totalSupply = useTotalSupply(classicPool ? classicPool[1]?.liquidityToken : undefined)
  const poolBalance = useTokenBalance(account ?? undefined, classicPool[1]?.liquidityToken)

  useEffect(() => {
    if (!classicPool[1]) return
    setPool(classicPool)
  }, [classicPool, setPool])

  useEffect(() => {
    if (!currencyA || !currencyB) return
    setCurrencies([currencyA, currencyB])
  }, [currencyA, currencyB, setCurrencies])

  useEffect(() => {
    if (!totalSupply) return
    setTotalSupply(totalSupply)
  }, [setTotalSupply, totalSupply])

  useEffect(() => {
    if (!poolBalance) return
    setPoolBalance(poolBalance)
  }, [poolBalance, setPoolBalance])

  const handleLiquidityModeChange = useRecoilCallback(
    ({ reset }) =>
      async () => {
        reset(mainInputAtom)
        reset(secondaryInputSelector)
        reset(zapInputAtom)
      },
    []
  )

  return (
    <div className="flex flex-col w-full mt-px mb-5">
      <div className="flex flex-col gap-4 p-5 bg-auto bg-dark-800 bg-bubble-pattern bg-opacity-60">
        <div className="flex flex-row justify-between">
          <Button
            color="blue"
            variant="outlined"
            size="sm"
            className="py-1 pl-2 rounded-full"
            startIcon={<ChevronLeftIcon width={24} height={24} />}
          >
            <Link href={`/trident/pool/${toHref('classic', currencies)}`}>{i18n._(t`Back`)}</Link>
          </Button>
          <DepositSettingsModal />
          {liquidityMode === LiquidityMode.ZAP && <SettingsTab />}
        </div>
        <div className="flex flex-col gap-2">
          <Typography variant="h2" weight={700} className="text-high-emphesis">
            {i18n._(t`Add Liquidity`)}
          </Typography>
          <Typography variant="sm">
            {i18n._(
              t`Deposit all pool tokens directly with Standard mode, or invest & rebalance with any asset in Zap mode.`
            )}
          </Typography>
        </div>

        {/*spacer*/}
        <div className="h-2" />
      </div>

      <ModeToggle onChange={handleLiquidityModeChange} />

      {liquidityMode === LiquidityMode.ZAP && <ClassicZapMode />}
      {liquidityMode === LiquidityMode.STANDARD && <ClassicStandardMode />}

      <AddTransactionReviewModalStandard />

      {/*<DepositSubmittedModal state={state} />*/}
    </div>
  )
}

AddClassic.Layout = TridentLayout
AddClassic.Provider = RecoilRoot

export default AddClassic