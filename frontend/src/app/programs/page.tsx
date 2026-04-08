'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { programsApi, universitiesApi } from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable from '@/components/common/DataTable'
import type { Program, University, Column } from '@/types'
import clsx from 'clsx'
import { XMarkIcon } from '@heroicons/react/24/outline'

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  under_review: 'bg-yellow-100 text-yellow-700',
}

const degreeColor: Record<string, string> = {
  bachelor: 'bg-blue-100 text-blue-700',
  master: 'bg-indigo-100 text-indigo-700',
  phd: 'bg-purple-100 text-purple-700',
  associate: 'bg-teal-100 text-teal-700',
}

export default function ProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [fieldFilter, setFieldFilter] = useState('')
  const [degreeFilter, setDegreeFilter] = useState('')
  const [uniFilter, setUniFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [progs, unis] = await Promise.all([
        programsApi.getPrograms(),
        universitiesApi.getUniversities(),
      ])
      setPrograms(progs)
      setUniversities(unis)
    } catch {
      // fail silently; table will show empty
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

  const uniMap = Object.fromEntries(universities.map((u) => [u.id, u.name]))

  const filtered = programs.filter((p) => {
    if (fieldFilter && !p.field.toLowerCase().includes(fieldFilter.toLowerCase())) return false
    if (degreeFilter && p.degree_level !== degreeFilter) return false
    if (uniFilter && String(p.university_id) !== uniFilter) return false
    return true
  })

  const fields = Array.from(new Set(programs.map((p) => p.field))).sort()

  const columns: Column[] = [
    { key: 'name', label: 'Name' },
    {
      key: 'university_id',
      label: 'University',
      render: (val) => uniMap[val as number] ?? `#${val}`,
    },
    { key: 'field', label: 'Field' },
    {
      key: 'degree_level',
      label: 'Degree',
      render: (val) => (
        <span
          className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
            degreeColor[val as string] ?? 'bg-gray-100 text-gray-600'
          )}
        >
          {String(val)}
        </span>
      ),
    },
    {
      key: 'enrolled_students',
      label: 'Enrolled',
      render: (val) => Number(val).toLocaleString(),
    },
    {
      key: 'graduation_rate',
      label: 'Grad. Rate',
      render: (val) => `${Number(val).toFixed(1)}%`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span
          className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
            statusColor[val as string] ?? 'bg-gray-100 text-gray-600'
          )}
        >
          {String(val).replace('_', ' ')}
        </span>
      ),
    },
  ]

  return (
    <DashboardLayout title="Programs">
      <div className="space-y-5">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Field</label>
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Fields</option>
              {fields.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Degree Level</label>
            <select
              value={degreeFilter}
              onChange={(e) => setDegreeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Degrees</option>
              {['associate', 'bachelor', 'master', 'phd'].map((d) => (
                <option key={d} value={d} className="capitalize">
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">University</label>
            <select
              value={uniFilter}
              onChange={(e) => setUniFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Universities</option>
              {universities.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          loading={loading}
          onRowClick={(row) => setSelectedProgram(row as unknown as Program)}
        />
      </div>

      {/* Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">{selectedProgram.name}</h2>
              <button
                onClick={() => setSelectedProgram(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['University', uniMap[selectedProgram.university_id] ?? `#${selectedProgram.university_id}`],
                ['Field', selectedProgram.field],
                ['Degree Level', selectedProgram.degree_level],
                ['Enrolled Students', selectedProgram.enrolled_students.toLocaleString()],
                ['Graduation Rate', `${selectedProgram.graduation_rate.toFixed(1)}%`],
                ['Status', selectedProgram.status.replace('_', ' ')],
                ['Created At', new Date(selectedProgram.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800 capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
