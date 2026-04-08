'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { analyticsApi } from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import KPICards from '@/components/dashboard/KPICards'
import FilterPanel from '@/components/dashboard/FilterPanel'
import TrendSummary from '@/components/dashboard/TrendSummary'
import DemandTrendChart from '@/components/charts/DemandTrendChart'
import EmploymentRateChart from '@/components/charts/EmploymentRateChart'
import SupplyDemandChart from '@/components/charts/SupplyDemandChart'
import SkillGapChart from '@/components/charts/SkillGapChart'
import RegionalHeatmap from '@/components/charts/RegionalHeatmap'
import type {
  DashboardKPIs,
  DemandSupplyData,
  SkillGapData,
  TrendData,
  RegionalData,
  FilterState,
} from '@/types'

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded-xl" />
      <div className="h-72 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-72 bg-gray-200 rounded-xl" />
        <div className="h-72 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-72 bg-gray-200 rounded-xl" />
        <div className="h-72 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [demandSupply, setDemandSupply] = useState<DemandSupplyData[]>([])
  const [skillGaps, setSkillGaps] = useState<SkillGapData[]>([])
  const [trends, setTrends] = useState<TrendData[]>([])
  const [regional, setRegional] = useState<RegionalData[]>([])
  const [filters, setFilters] = useState<FilterState>({ timePeriod: '1Y' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [k, ds, sg, t, r] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getDemandSupply(),
        analyticsApi.getSkillGaps(),
        analyticsApi.getTrends(),
        analyticsApi.getRegional(),
      ])
      setKpis(k)
      setDemandSupply(ds)
      setSkillGaps(sg)
      setTrends(t)
      setRegional(r)
    } catch {
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }
    fetchData()
  }, [router, fetchData])

  // Employment rate chart data derived from demand/supply
  const employmentData = demandSupply.map((d) => ({
    field: d.specialization,
    rate: Math.min(100, d.supply_score),
  }))

  return (
    <DashboardLayout title="Dashboard">
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {kpis && <KPICards kpis={kpis} />}

          <FilterPanel onFilterChange={setFilters} />

          <DemandTrendChart data={trends} title="Specialization Demand Trends" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmploymentRateChart data={employmentData} />
            <SupplyDemandChart data={demandSupply} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkillGapChart data={skillGaps} />
            <RegionalHeatmap data={regional} />
          </div>

          <TrendSummary trends={trends} />
        </div>
      )}
    </DashboardLayout>
  )
}
