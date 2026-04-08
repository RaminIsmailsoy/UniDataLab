'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DemandSupplyData } from '@/types'

interface Props {
  data: DemandSupplyData[]
}

export default function SupplyDemandChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Supply vs Demand by Specialization</h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="specialization"
              tick={{ fontSize: 11 }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number, name: string) => [
                value.toFixed(1),
                name === 'demand_score' ? 'Demand' : 'Supply',
              ]}
            />
            <Legend
              formatter={(value) => (value === 'demand_score' ? 'Demand Score' : 'Supply Score')}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="demand_score" name="demand_score" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="supply_score" name="supply_score" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
