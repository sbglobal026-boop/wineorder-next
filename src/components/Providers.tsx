'use client'
import { AppConfigProvider } from '@/context/AppConfigContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppConfigProvider>{children}</AppConfigProvider>
}
