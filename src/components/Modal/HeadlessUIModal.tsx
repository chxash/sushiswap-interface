import { Dialog, Transition } from '@headlessui/react'
import ModalAction, { ModalActionProps } from 'app/components/Modal/Action'
import ModalActions, { ModalActionsProps } from 'app/components/Modal/Actions'
import ModalBody, { ModalBodyProps } from 'app/components/Modal/Body'
import ModalContent, { ModalContentProps } from 'app/components/Modal/Content'
import ModalError, { ModalActionErrorProps } from 'app/components/Modal/Error'
import ModalHeader, { ModalHeaderProps } from 'app/components/Modal/Header'
import SubmittedModalContent, { SubmittedModalContentProps } from 'app/components/Modal/SubmittedModalContent'
import { cloneElement, FC, isValidElement, ReactNode, useCallback, useMemo, useState } from 'react'
import React, { Fragment } from 'react'

import { classNames } from '../../functions'
import useDesktopMediaQuery from '../../hooks/useDesktopMediaQuery'

interface TriggerProps {
  open: boolean
  setOpen: (x: boolean) => void
  onClick: () => void
}

interface Props {
  trigger?: (({ open, onClick, setOpen }: TriggerProps) => ReactNode) | ReactNode
}

type HeadlessUiModalType<P> = FC<P> & {
  Controlled: FC<ControlledModalProps>
  Body: FC<ModalBodyProps>
  Actions: FC<ModalActionsProps>
  Content: FC<ModalContentProps>
  Header: FC<ModalHeaderProps>
  Action: FC<ModalActionProps>
  SubmittedModalContent: FC<SubmittedModalContentProps>
  Error: FC<ModalActionErrorProps>
}

const HeadlessUiModal: HeadlessUiModalType<Props> = ({ children: childrenProp, trigger: triggerProp }) => {
  const [open, setOpen] = useState(false)

  const onClick = useCallback(() => {
    setOpen(true)
  }, [])

  // If trigger is a function, render props
  // Else (default), check if element is valid and pass click handler
  const trigger = useMemo(
    () =>
      typeof triggerProp === 'function'
        ? triggerProp({ onClick, open, setOpen })
        : isValidElement(triggerProp)
        ? cloneElement(triggerProp, { onClick })
        : null,
    [onClick, open, triggerProp]
  )

  // If children is a function, render props
  // Else just render normally
  const children = useMemo(
    () => (typeof childrenProp === 'function' ? childrenProp({ onClick, open, setOpen }) : children),
    [onClick, open, childrenProp]
  )

  return (
    <>
      {trigger && trigger}
      <HeadlessUiModalControlled isOpen={open} onDismiss={() => setOpen(false)}>
        {children}
      </HeadlessUiModalControlled>
    </>
  )
}

interface ControlledModalProps {
  isOpen: boolean
  onDismiss: () => void
  afterLeave?: () => void
  children?: React.ReactNode
  className?: string
}

const HeadlessUiModalControlled: FC<ControlledModalProps> = ({
  className,
  isOpen,
  onDismiss,
  afterLeave,
  children,
}) => {
  const isDesktop = useDesktopMediaQuery()

  return (
    <Transition appear show={isOpen} as={Fragment} afterLeave={afterLeave}>
      <Dialog
        as="div"
        className={classNames('fixed z-50 inset-0 overflow-y-auto', isDesktop ? '' : 'bg-dark-900', className)}
        onClose={onDismiss}
      >
        {isDesktop ? (
          <div className="relative flex items-center justify-center block min-h-screen text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 filter backdrop-blur-[10px] bg-[rgb(0,0,0,0.4)]" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                className={classNames(
                  className ? className : 'bg-dark-900 shadow-lg',
                  'lg:max-w-lg lg:w-[32rem] inline-block align-bottom rounded-lg text-left overflow-hidden transform'
                )}
              >
                {children}
              </div>
            </Transition.Child>
          </div>
        ) : (
          <div className="w-full h-full">{children}</div>
        )}
      </Dialog>
    </Transition>
  )
}

HeadlessUiModal.Controlled = HeadlessUiModalControlled
HeadlessUiModal.Header = ModalHeader
HeadlessUiModal.Body = ModalBody
HeadlessUiModal.Content = ModalContent
HeadlessUiModal.Actions = ModalActions
HeadlessUiModal.Action = ModalAction
HeadlessUiModal.Error = ModalError
HeadlessUiModal.SubmittedModalContent = SubmittedModalContent

export default HeadlessUiModal
