'use client'

import { useState, useEffect } from 'react'
import type { FilterState } from '@/types'
import { universitiesApi } from '@/lib/api'
import type { University } from '@/types'

interface Props {
  onFilterChange: (filters: FilterState) => void
}

const regions = ['All', 'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
const timePeriods = ['1Y', '2Y', '3Y', '5Y']
const industries = ['All', 'Technology', 'Healthcare', 'Finance', 'Engineering', 'Business', 'Education', 'Arts']

export default function FilterPanel({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>({ timePeriod: '1Y' })
  const [universities, setUniversities] = useState<University[]>([])

  useEffect(() => {
    universitiesApi.getUniversities().then(setUniversities).catch(() => null)
  }, [])

  function update(patch: Partial<FilterState>) {
    const next = { ...filters, ...patch }
    setFilters(next)
    onFilterChange(next)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Region */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500">Region</label>
          <select
            value={filters.region ?? 'All'}
            onChange={(e) => update({ region: e.target.value === 'All' ? undefined : e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Time Period */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Time Period</label>
          <div className="flex gap-1">
            {timePeriods.map((t) => (
              <button
                key={t}
                onClick={() => update({ timePeriod: t })}
                className={`px-3 py-2 text-sm rounded-lg font-medium border transition-colors ${
                  filters.timePeriod === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500">Industry</label>
          <select
            value={filters.industry ?? 'All'}
            onChange={(e) => update({ industry: e.target.value === 'All' ? undefined : e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {industries.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>

        {/* University */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-500">University</label>
          <select
            value={filters.university_id ?? ''}
            onChange={(e) =>
              update({ university_id: e.target.value ? Number(e.target.value) : undefined })
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Universities</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
