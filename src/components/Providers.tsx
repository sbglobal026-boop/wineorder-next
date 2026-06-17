'use client'
import { AppConfigProvider } from '@/context/AppConfigContext'
import { AuthProvider } from '@/context/AuthContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppConfigProvider>{children}</AppConfigProvider>
    </AuthProvider>
  )
}
