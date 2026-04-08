'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { recommendationsApi, universitiesApi } from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RecommendationList from '@/components/recommendations/RecommendationList'
import type { Recommendation, University } from '@/types'
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function RecommendationsPage() {
  const router = useRouter()
  const [universities, setUniversities] = useState<University[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<number | undefined>()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }
    universitiesApi.getUniversities().then(setUniversities).catch(() => null)
  }, [router])

  const fetchRecommendations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = selectedUniversity
        ? await recommendationsApi.getRecommendationsForUniversity(selectedUniversity)
        : await recommendationsApi.getRecommendations()
      setRecommendations(data)
    } catch {
      setError('Failed to load recommendations.')
    } finally {
      setLoading(false)
    }
  }, [selectedUniversity])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  async function handleGenerate() {
    setGenerating(true)
    try {
      await recommendationsApi.generateRecommendations(selectedUniversity)
      setLastGenerated(new Date().toLocaleString())
      await fetchRecommendations()
    } catch {
      setError('Failed to generate recommendations.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <DashboardLayout title="Recommendations">
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">University</label>
                <select
                  value={selectedUniversity ?? ''}
                  onChange={(e) =>
                    setSelectedUniversity(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Universities</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchRecommendations}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {generating ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
                {generating ? 'Generating…' : 'Generate New Recommendations'}
              </button>
              {lastGenerated && (
                <p className="text-xs text-gray-400">Last generated: {lastGenerated}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <RecommendationList recommendations={recommendations} />
        )}
      </div>
    </DashboardLayout>
  )
}
