'use client'

import { useMemo } from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'
import type { TrendData } from '@/types'

interface Props {
  trends: TrendData[]
}

interface SpecSummary {
  specialization: string
  growth: number
}

export default function TrendSummary({ trends }: Props) {
  const { growing, declining } = useMemo(() => {
    const bySpec: Record<string, number[]> = {}
    trends.forEach(({ specialization, value }) => {
      if (!bySpec[specialization]) bySpec[specialization] = []
      bySpec[specialization].push(value)
    })

    const summaries: SpecSummary[] = Object.entries(bySpec).map(([specialization, values]) => {
      const first = values[0]
      const last = values[values.length - 1]
      const growth = first === 0 ? 0 : ((last - first) / first) * 100
      return { specialization, growth }
    })

    summaries.sort((a, b) => b.growth - a.growth)

    return {
      growing: summaries.slice(0, 5),
      declining: summaries.slice(-5).reverse(),
    }
  }, [trends])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Trend Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growing */}
        <div>
          <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1">
            <ArrowTrendingUpIcon className="w-4 h-4" /> Top Growing Specializations
          </p>
          <ul className="space-y-2">
            {growing.map(({ specialization, growth }) => (
              <li key={specialization} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{specialization}</span>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  +{growth.toFixed(1)}%
                </span>
              </li>
            ))}
            {growing.length === 0 && (
              <li className="text-sm text-gray-400">No data</li>
            )}
          </ul>
        </div>

        {/* Declining */}
        <div>
          <p className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1">
            <ArrowTrendingDownIcon className="w-4 h-4" /> Top Declining Specializations
          </p>
          <ul className="space-y-2">
            {declining.map(({ specialization, growth }) => (
              <li key={specialization} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{specialization}</span>
                <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {growth.toFixed(1)}%
                </span>
              </li>
            ))}
            {declining.length === 0 && (
              <li className="text-sm text-gray-400">No data</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
