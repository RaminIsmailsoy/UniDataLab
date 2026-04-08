'use client'

import {
  ChartBarIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import type { DashboardKPIs } from '@/types'
import clsx from 'clsx'

interface Props {
  kpis: DashboardKPIs
}

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ElementType
  accent: string
  iconBg: string
}

function KPICard({ title, value, icon: Icon, accent, iconBg }: KPICardProps) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border-l-4 p-5 flex items-center gap-4', accent)}>
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function KPICards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        title="Total Programs Analyzed"
        value={kpis.total_programs}
        icon={ChartBarIcon}
        accent="border-blue-600"
        iconBg="bg-blue-600"
      />
      <KPICard
        title="Avg Employment Rate"
        value={`${kpis.avg_employment_rate.toFixed(1)}%`}
        icon={BriefcaseIcon}
        accent="border-green-500"
        iconBg="bg-green-500"
      />
      <KPICard
        title="Top Growing Field"
        value={kpis.top_growing_field}
        icon={ArrowTrendingUpIcon}
        accent="border-indigo-600"
        iconBg="bg-indigo-600"
      />
      <KPICard
        title="Programs Needing Attention"
        value={kpis.programs_needing_attention}
        icon={ExclamationTriangleIcon}
        accent="border-yellow-500"
        iconBg="bg-yellow-500"
      />
    </div>
  )
}
