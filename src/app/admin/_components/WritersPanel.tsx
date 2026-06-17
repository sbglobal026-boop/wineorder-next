'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppConfig } from '@/context/AppConfigContext'

type UserRow = {
  id: string
  email: string
  name: string
}

export default function WritersPanel() {
  const { config, approveWriter, revokeWriter } = useAppConfig()
  const [users, setUsers] = useState<UserRow[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.admin?.listUsers().then(({ data }) => {
      if (data?.users) {
        setUsers(data.users.map(u => ({
          id: u.id,
          email: u.email ?? '',
          name: u.user_metadata?.name ?? u.email ?? '',
        })))
      }
    })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">작성자 관리</h2>
      <p className="text-gray-500 text-sm mb-8">가입한 회원에게 블로그 글쓰기 권한을 부여합니다</p>

      {users.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">가입한 회원이 없습니다</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {users.map((user) => {
            const isApproved = config.approvedWriters.includes(user.email)
            return (
              <div key={user.id} className="flex items-center gap-4 py-4 px-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gray-500">{user.name[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                {isApproved ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                      ✓ 승인됨
                    </span>
                    <button
                      onClick={() => revokeWriter(user.email)}
                      className="text-xs text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => approveWriter(user.email)}
                    className="text-xs text-gray-600 hover:text-green-700 border border-gray-200 hover:border-green-300 hover:bg-green-50 px-4 py-1.5 rounded-full transition-colors font-medium"
                  >
                    승인
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
