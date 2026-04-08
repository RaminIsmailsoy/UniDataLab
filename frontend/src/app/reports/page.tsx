'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExportButton from '@/components/common/ExportButton'
import { DocumentArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline'

interface ExportRecord {
  type: 'csv' | 'pdf'
  timestamp: string
  filename: string
}

const STORAGE_KEY = 'udl_exports'

function loadExports(): ExportRecord[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as ExportRecord[]
  } catch {
    return []
  }
}

function saveExport(record: ExportRecord) {
  const existing = loadExports()
  const updated = [record, ...existing].slice(0, 10)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export default function ReportsPage() {
  const router = useRouter()
  const [recentExports, setRecentExports] = useState<ExportRecord[]>([])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }
    setRecentExports(loadExports())
  }, [router])

  function handleExportComplete(type: 'csv' | 'pdf') {
    const record: ExportRecord = {
      type,
      timestamp: new Date().toISOString(),
      filename: `unidatalab-report.${type}`,
    }
    saveExport(record)
    setRecentExports(loadExports())
  }

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        {/* Export Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DocumentArrowDownIcon className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">CSV Export</h3>
                <p className="text-xs text-gray-500">Download all analytics data as CSV</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-700 mb-2">Includes:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Program enrollment data</li>
                <li>Employment rate statistics</li>
                <li>Demand/supply analysis</li>
                <li>Skill gap metrics</li>
                <li>Regional breakdowns</li>
              </ul>
            </div>
            <div onClick={() => handleExportComplete('csv')}>
              <ExportButton type="csv" filename="unidatalab-report.csv" />
            </div>
          </div>

          {/* PDF */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <DocumentArrowDownIcon className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">PDF Export</h3>
                <p className="text-xs text-gray-500">Download a formatted PDF report</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-700 mb-2">Includes:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Executive summary</li>
                <li>Charts and visualizations</li>
                <li>Recommendations overview</li>
                <li>University program analysis</li>
                <li>Industry forecasts</li>
              </ul>
            </div>
            <div onClick={() => handleExportComplete('pdf')}>
              <ExportButton type="pdf" filename="unidatalab-report.pdf" />
            </div>
          </div>
        </div>

        {/* Recent Exports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            Recent Exports
          </h3>
          {recentExports.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No exports yet. Download a report above.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentExports.map((exp, i) => (
                <li key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        exp.type === 'csv'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {exp.type}
                    </span>
                    <span className="text-sm text-gray-700">{exp.filename}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(exp.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
