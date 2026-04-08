'use client'

import { useEffect, useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { authApi } from '@/lib/api'
import type { User } from '@/types'
import clsx from 'clsx'

interface HeaderProps {
  title: string
}

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  analyst: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-700',
}

export default function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    authApi
      .getMe()
      .then(setUser)
      .catch(() => null)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800 leading-tight">{user.full_name}</p>
              <span
                className={clsx(
                  'text-xs font-medium px-1.5 py-0.5 rounded capitalize',
                  roleBadgeColor[user.role] ?? 'bg-gray-100 text-gray-700'
                )}
              >
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
