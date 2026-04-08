'use client'

import { useState, useMemo } from 'react'
import type { Recommendation } from '@/types'
import RecommendationCard from './RecommendationCard'

interface Props {
  recommendations: Recommendation[]
}

const ACTIONS: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'expand', label: 'Expand' },
  { key: 'open', label: 'Open' },
  { key: 'monitor', label: 'Monitor' },
  { key: 'reduce', label: 'Reduce' },
  { key: 'close', label: 'Close' },
]

export default function RecommendationList({ recommendations }: Props) {
  const [activeAction, setActiveAction] = useState('all')

  const filtered = useMemo(() => {
    const base =
      activeAction === 'all'
        ? recommendations
        : recommendations.filter((r) => r.action === activeAction)
    return [...base].sort((a, b) => b.score - a.score)
  }, [recommendations, activeAction])

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(({ key, label }) => {
          const count =
            key === 'all'
              ? recommendations.length
              : recommendations.filter((r) => r.action === key).length
          return (
            <button
              key={key}
              onClick={() => setActiveAction(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeAction === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {label}
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeAction === key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No recommendations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  )
}
