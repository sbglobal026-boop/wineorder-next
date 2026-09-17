'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { tierFromAppMetadata, type MemberTier } from '@/lib/memberTiers'

type CurrentUser = {
  id: string
  email: string
  name: string
  tier: MemberTier // 회원 등급 (어드민 회원관리에서 지정)
}

function toCurrentUser(user: User): CurrentUser {
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name ?? user.email!,
    tier: tierFromAppMetadata(user.app_metadata),
  }
}

type AuthContextType = {
  currentUser: CurrentUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  // 세션 확인이 끝나기 전(null)과 "확인 결과 비로그인"(null)을 구분하기 위한 플래그.
  // 이게 없으면 새로고침 직후 currentUser가 잠깐 null인 순간을 로그아웃 상태로 오인해 로그인 페이지로 튕겨나감.
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(toCurrentUser(session.user))
        // 세션(토큰)에 담긴 등급은 로그인·토큰 갱신 시점의 값이라, 어드민이 바꾼 최신 등급을 서버에서 다시 받아옴
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) setCurrentUser(prev => (prev?.id === user.id ? toCurrentUser(user) : prev))
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const next = toCurrentUser(session.user)
        // 같은 사용자의 세션 재확인(탭 복귀 등)은 옛 토큰 값일 수 있으므로 서버에서 받은 등급을 유지
        // 토큰이 새로 발급된 경우(TOKEN_REFRESHED)에만 토큰의 등급으로 갱신
        setCurrentUser(prev =>
          prev?.id === next.id && event !== 'TOKEN_REFRESHED' ? { ...next, tier: prev.tier } : next
        )
      } else {
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return error ? error.message : null
  }

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
