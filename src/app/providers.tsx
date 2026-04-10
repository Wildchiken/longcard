'use client'

import type { ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n/context'
import { ToastProvider } from '@/lib/toast-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>{children}</ToastProvider>
    </I18nProvider>
  )
}
