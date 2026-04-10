'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

interface ToastContextValue {
  showToast: (opts: { variant: ToastVariant; message: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DISMISS_MS = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null)
  const idRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismissIf = useCallback((id: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToast((t) => (t?.id === id ? null : t))
  }, [])

  const showToast = useCallback((opts: { variant: ToastVariant; message: string }) => {
    const id = ++idRef.current
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ id, variant: opts.variant, message: opts.message })
    timerRef.current = setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t))
      timerRef.current = null
    }, DISMISS_MS)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <button
          type="button"
          role="status"
          aria-live="polite"
          onClick={() => dismissIf(toast.id)}
          className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[200] max-w-[min(92vw,420px)] -translate-x-1/2 cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-medium shadow-lg ring-1 ring-black/8 dark:ring-white/15 transition-opacity hover:opacity-95 active:opacity-90 touch-manipulation ${
            toast.variant === 'error'
              ? 'bg-red-950 text-red-50'
              : toast.variant === 'success'
                ? 'bg-emerald-950 text-emerald-50'
                : 'bg-[#171717] text-white'
          }`}
        >
          {toast.message}
        </button>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
