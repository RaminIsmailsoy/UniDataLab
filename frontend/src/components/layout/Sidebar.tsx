'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import {
  ChartBarIcon,
  LightBulbIcon,
  AcademicCapIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'
import { removeToken, isAdmin } from '@/lib/auth'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { label: 'Recommendations', href: '/recommendations', icon: LightBulbIcon },
  { label: 'Programs', href: '/programs', icon: AcademicCapIcon },
  { label: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    removeToken()
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <BeakerIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">UniDataLab</p>
          <p className="text-gray-400 text-xs">Intelligence Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}

        {isAdmin() && (
          <Link
            href="/admin"
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
            Admin
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
