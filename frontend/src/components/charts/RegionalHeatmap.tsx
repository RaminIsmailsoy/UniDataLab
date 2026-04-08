'use client'

import clsx from 'clsx'
import type { RegionalData } from '@/types'

interface Props {
  data: RegionalData[]
}

function heatColor(value: number, min: number, max: number): string {
  if (max === min) return 'bg-blue-100'
  const ratio = (value - min) / (max - min)
  if (ratio >= 0.8) return 'bg-blue-700 text-white'
  if (ratio >= 0.6) return 'bg-blue-500 text-white'
  if (ratio >= 0.4) return 'bg-blue-300 text-gray-800'
  if (ratio >= 0.2) return 'bg-blue-200 text-gray-800'
  return 'bg-blue-100 text-gray-800'
}

export default function RegionalHeatmap({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Regional Overview</h3>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No regional data available
        </div>
      </div>
    )
  }

  const empMin = Math.min(...data.map((d) => d.employment_rate))
  const empMax = Math.max(...data.map((d) => d.employment_rate))
  const demMin = Math.min(...data.map((d) => d.demand_score))
  const demMax = Math.max(...data.map((d) => d.demand_score))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Regional Overview</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="pb-3 pr-4 font-semibold text-gray-600">Region</th>
              <th className="pb-3 pr-4 font-semibold text-gray-600 text-center">Programs</th>
              <th className="pb-3 pr-4 font-semibold text-gray-600 text-center">
                Employment Rate
              </th>
              <th className="pb-3 font-semibold text-gray-600 text-center">Demand Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => (
              <tr key={row.region}>
                <td className="py-2 pr-4 font-medium text-gray-700">{row.region}</td>
                <td className="py-2 pr-4 text-center text-gray-600">{row.programs}</td>
                <td className="py-2 pr-4">
                  <div className="flex justify-center">
                    <span
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        heatColor(row.employment_rate, empMin, empMax)
                      )}
                    >
                      {row.employment_rate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex justify-center">
                    <span
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        heatColor(row.demand_score, demMin, demMax)
                      )}
                    >
                      {row.demand_score.toFixed(1)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <span>Low</span>
        <div className="flex gap-1">
          {['bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-500', 'bg-blue-700'].map(
            (c) => (
              <span key={c} className={`w-5 h-3 rounded ${c} block`} />
            )
          )}
        </div>
        <span>High</span>
      </div>
    </div>
  )
}
