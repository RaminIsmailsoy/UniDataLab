'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TrendData } from '@/types'

interface Props {
  data: TrendData[]
  title?: string
}

const COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706',
  '#0891b2', '#dc2626', '#65a30d', '#c026d3',
]

export default function DemandTrendChart({ data, title = 'Demand Trends Over Time' }: Props) {
  // Pivot data: [{date, spec1, spec2, ...}]
  const specializations = Array.from(new Set(data.map((d) => d.specialization)))

  const pivoted = Array.from(new Set(data.map((d) => d.date))).sort().map((date) => {
    const row: Record<string, unknown> = { date }
    specializations.forEach((spec) => {
      const match = data.find((d) => d.date === date && d.specialization === spec)
      row[spec] = match?.value ?? null
    })
    return row
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      {pivoted.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No trend data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={pivoted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {specializations.map((spec, i) => (
              <Line
                key={spec}
                type="monotone"
                dataKey={spec}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
