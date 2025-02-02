import { ElementHandle } from 'puppeteer'

import { ILiquidityInfo } from '../../interfaces/ILiquidityInfo'
import { AppPage } from '../AppPage'

export class RemoveLiquidityPage extends AppPage {
  protected BackToPoolsButtonSelector: string = '#btn-withdraw-success-back'
  protected ModalConfirmWithdrawButtonSelector: string = '#btn-modal-confirm-withdrawal'
  protected ReviewAndConfirmButtonSelector: string = '#btn-confirm-remove-liquidity'

  protected ApproveButtonSelector: string = '#btn-approve'
  protected FixedRatioCheckboxSelector: string = '#chk-fixed-ratio-withdraw'
  protected RemovePercentSelector: string = '#radio-option-'

  protected WithdrawToSelector: string = '#txt-withdraw-to'
  protected CheckOutputToWalletSelector: string = '#chk-output-to-wallet'

  protected EstimatedOutputTextSelector: string = '-min-liquidity-output'

  public async removeLiquidity(percent: number, outputToWallet: boolean, fixedRatio: boolean = false): Promise<void> {
    await this.setRemovePercent(percent)
    await this.setFixedRatio(fixedRatio)
    await this.setWithdrawToWallet(outputToWallet)
    await this.confirmWithdrawal()
  }

  public async getMinLiquidityOutput(poolName: string): Promise<ILiquidityInfo> {
    await this.blockingWait(1, true)

    const assets = poolName.toLowerCase().split('-')
    const assetA = assets[0]
    const assetB = assets[1]

    const estimatedOutput: ILiquidityInfo = {
      assetA: assetA,
      assetB: assetB,
      amountA: await this.getEstimatedOutputForAsset(assetA),
      amountB: await this.getEstimatedOutputForAsset(assetB),
    }

    return estimatedOutput
  }

  private async getEstimatedOutputForAsset(asset: string): Promise<number> {
    const selector = `#` + asset + this.EstimatedOutputTextSelector
    await this.Page.waitForSelector(selector)

    const assetAEstimatedOutputDiv = await this.Page.$(selector)
    const estimatedOutputString = (await (
      await assetAEstimatedOutputDiv.getProperty('textContent')
    ).jsonValue()) as string

    return parseFloat(estimatedOutputString)
  }

  public async setFixedRatio(fixedRatio: boolean): Promise<void> {
    await this.blockingWait(1, true)
    const fixedRatioCheckbox = await this.getFixedRatioCheckbox()

    if (fixedRatio && !(await this.isFixedRatioChecked())) {
      await fixedRatioCheckbox.click()
    } else if (!fixedRatio && (await this.isFixedRatioChecked())) {
      await fixedRatioCheckbox.click()
    }
  }

  public async confirmWithdrawal(): Promise<void> {
    await this.blockingWait(1, true)
    const approveButton = await this.Page.$(this.ApproveButtonSelector)
    if (approveButton) {
      await approveButton.click()
      await this.Metamask.sign()
      await this.Metamask.page.waitForTimeout(1000)
      await this.bringToFront()
    }

    const reviewConfirmButton = await this.Page.waitForSelector(this.ReviewAndConfirmButtonSelector)
    await reviewConfirmButton.click()
    await this.Page.waitForTimeout(500)

    const modalConfirmWithdrawButton = await this.Page.waitForSelector(this.ModalConfirmWithdrawButtonSelector)
    await modalConfirmWithdrawButton.click()

    await this.confirmMetamaskTransaction()

    const backToPoolsButton = await this.Page.waitForSelector(this.BackToPoolsButtonSelector)
    await backToPoolsButton.click()

    await this.blockingWait(5)
  }

  public async setWithdrawToWallet(withdrawToWallet: boolean): Promise<void> {
    await this.blockingWait(1, true)
    const withdrawToElement = await this.Page.waitForSelector(this.WithdrawToSelector)
    const withdrawTo = await this.Page.evaluate((el) => el.textContent, withdrawToElement)

    const outputSelector = await this.Page.waitForSelector(this.CheckOutputToWalletSelector)
    const outputSelectorButton = (await outputSelector.$x('..'))[0]

    if (withdrawToWallet && withdrawTo.toLowerCase() !== 'wallet') {
      await outputSelectorButton.click()
    } else if (!withdrawToWallet && withdrawTo.toLowerCase() !== 'bentobox') {
      await outputSelectorButton.click()
    }
  }

  public async setRemovePercent(percent: number): Promise<void> {
    await this.blockingWait(1, true)
    const percentSelectionButton = await this.Page.waitForSelector(this.RemovePercentSelector + percent.toString())
    await percentSelectionButton.click()
  }

  private async getFixedRatioCheckbox(): Promise<ElementHandle<Element>> {
    await this.Page.waitForSelector(this.FixedRatioCheckboxSelector)
    const fixedRateCheckbox = await this.Page.$(this.FixedRatioCheckboxSelector)

    return fixedRateCheckbox
  }

  private async isFixedRatioChecked(): Promise<boolean> {
    let fixedRatioChecked: boolean

    const fixedRatioCheckbox = await this.getFixedRatioCheckbox()
    fixedRatioChecked = (await (await fixedRatioCheckbox.getProperty('checked')).jsonValue()) as boolean

    return fixedRatioChecked
  }
}
