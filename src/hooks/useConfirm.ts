import { useCallback, useRef, useState } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ToastState {
  id: number
  message: string
  action?: { label: string; onClick: () => void }
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(
    null,
  )
  const [toasts, setToasts] = useState<ToastState[]>([])
  const toastId = useRef(0)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve })
    })
  }, [])

  const dismissConfirm = useCallback((result: boolean) => {
    setConfirmState((current) => {
      current?.resolve(result)
      return null
    })
  }, [])

  const showToast = useCallback((message: string, action?: ToastState['action'], durationMs = 5000) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, message, action }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, durationMs)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { confirmState, confirm, dismissConfirm, toasts, showToast, dismissToast }
}

export type ConfirmHook = ReturnType<typeof useConfirm>
