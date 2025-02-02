import { Currency, Token } from '@sushiswap/core-sdk'
import Button from 'app/components/Button'
import CloseIcon from 'app/components/CloseIcon'
import { AutoColumn } from 'app/components/Column'
import { CurrencyLogo } from 'app/components/CurrencyLogo'
import ExternalLink from 'app/components/ExternalLink'
import HeadlessUiModal from 'app/components/Modal/HeadlessUIModal'
import { AutoRow, RowBetween } from 'app/components/Row'
import { classNames } from 'app/functions'
import { getExplorerLink } from 'app/functions/explorer'
import { useUnsupportedTokens } from 'app/hooks/Tokens'
import { useActiveWeb3React } from 'app/services/web3'
import React, { useState } from 'react'

export default function UnsupportedCurrencyFooter({
  show,
  currencies,
}: {
  show: boolean
  currencies: (Currency | undefined)[]
}) {
  const { chainId } = useActiveWeb3React()
  const [showDetails, setShowDetails] = useState(false)

  const tokens =
    chainId && currencies
      ? currencies.map((currency) => {
          return currency?.wrapped
        })
      : []

  const unsupportedTokens: { [address: string]: Token } = useUnsupportedTokens()

  return (
    <div
      className={classNames(
        show ? 'translate-y-0' : '-translate-y-full',
        'text-center transition-transform z-[-1] w-full -mt-8 pb-5 pt-12'
      )}
    >
      <HeadlessUiModal.Controlled isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <div className="p-6">
          <AutoColumn gap="lg">
            <RowBetween>
              <div>Unsupported Assets</div>

              <CloseIcon onClick={() => setShowDetails(false)} />
            </RowBetween>
            {tokens.map((token) => {
              return (
                token &&
                unsupportedTokens &&
                Object.keys(unsupportedTokens).includes(token.address) && (
                  <div className="border border-dark-700" key={token.address?.concat('not-supported')}>
                    <AutoColumn gap="10px">
                      <AutoRow gap="5px" align="center">
                        <CurrencyLogo currency={token} size={'24px'} />
                        <div className="font-medium">{token.symbol}</div>
                      </AutoRow>
                      {chainId && (
                        <ExternalLink href={getExplorerLink(chainId, token.address, 'address')}>
                          <div className="text-xs">{token.address}</div>
                        </ExternalLink>
                      )}
                    </AutoColumn>
                  </div>
                )
              )
            })}
            <AutoColumn gap="lg">
              <div className="font-medium">
                Some assets are not available through this interface because they may not work well with our smart
                contract or we are unable to allow trading for legal reasons.
              </div>
            </AutoColumn>
          </AutoColumn>
        </div>
      </HeadlessUiModal.Controlled>
      <Button variant="empty" style={{ padding: '0px' }} onClick={() => setShowDetails(true)}>
        <div>Read more about unsupported assets</div>
      </Button>
    </div>
  )
}
