'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, isAdmin } from '@/lib/auth'
import { universitiesApi, programsApi, jobMarketApi, usersApi, recommendationsApi } from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable from '@/components/common/DataTable'
import type { University, Program, User, Column } from '@/types'
import { XMarkIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

type TabId = 'universities' | 'programs' | 'users' | 'ingestion'

// ─── Minimal modal form ───────────────────────────────────────────────────────

interface Field {
  key: string
  label: string
  type?: string
}

interface FormModalProps {
  title: string
  fields: Field[]
  initial?: Record<string, unknown>
  onClose: () => void
  onSubmit: (data: Record<string, string>) => Promise<void>
}

function FormModal({ title, fields, initial = {}, onClose, onSubmit }: FormModalProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, String(initial[f.key] ?? '')]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'An error occurred'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type ?? 'text'}
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Ingestion Form ───────────────────────────────────────────────────────────

function IngestionTab() {
  const [form, setForm] = useState({
    specialization: '',
    region: '',
    job_openings: '',
    avg_salary: '',
    demand_score: '',
    growth_rate: '',
    top_skills: '',
    source: '',
    data_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      await jobMarketApi.ingestJobMarket({
        specialization: form.specialization,
        region: form.region,
        job_openings: Number(form.job_openings),
        avg_salary: Number(form.avg_salary),
        demand_score: Number(form.demand_score),
        growth_rate: Number(form.growth_rate),
        top_skills: form.top_skills.split(',').map((s) => s.trim()),
        source: form.source,
        data_date: form.data_date,
      })
      setMsg({ type: 'success', text: 'Data ingested successfully.' })
    } catch {
      setMsg({ type: 'error', text: 'Ingestion failed. Please check the fields.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate() {
    setGenLoading(true)
    setMsg(null)
    try {
      await recommendationsApi.generateRecommendations()
      setMsg({ type: 'success', text: 'Recommendations generated successfully.' })
    } catch {
      setMsg({ type: 'error', text: 'Generation failed.' })
    } finally {
      setGenLoading(false)
    }
  }

  const fields: Array<{ key: keyof typeof form; label: string; type?: string }> = [
    { key: 'specialization', label: 'Specialization' },
    { key: 'region', label: 'Region' },
    { key: 'job_openings', label: 'Job Openings', type: 'number' },
    { key: 'avg_salary', label: 'Avg Salary ($)', type: 'number' },
    { key: 'demand_score', label: 'Demand Score (0-100)', type: 'number' },
    { key: 'growth_rate', label: 'Growth Rate (%)', type: 'number' },
    { key: 'top_skills', label: 'Top Skills (comma-separated)' },
    { key: 'source', label: 'Source' },
    { key: 'data_date', label: 'Data Date', type: 'date' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Ingest Job Market Data</h3>
        <form onSubmit={handleIngest} className="space-y-4">
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type ?? 'text'}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          {msg && (
            <p
              className={clsx(
                'text-sm',
                msg.type === 'success' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {msg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Ingesting…' : 'Ingest Data'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
        <h3 className="font-semibold text-gray-800">Generate Recommendations</h3>
        <p className="text-sm text-gray-500">
          Trigger the recommendation engine to analyze current data and generate actionable insights
          for all universities.
        </p>
        <button
          onClick={handleGenerate}
          disabled={genLoading}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {genLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
          {genLoading ? 'Generating…' : 'Generate All Recommendations'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('universities')
  const [universities, setUniversities] = useState<University[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'addUni' | 'addProg' | 'editUni' | 'editProg'>(null)
  const [editTarget, setEditTarget] = useState<University | Program | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return }
    if (!isAdmin()) { router.replace('/dashboard'); return }
  }, [router])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [unis, progs, us] = await Promise.all([
        universitiesApi.getUniversities(),
        programsApi.getPrograms(),
        usersApi.getUsers(),
      ])
      setUniversities(unis)
      setPrograms(progs)
      setUsers(us)
    } catch {
      // best effort
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'universities', label: 'Universities' },
    { id: 'programs', label: 'Programs' },
    { id: 'users', label: 'Users' },
    { id: 'ingestion', label: 'Data Ingestion' },
  ]

  const uniColumns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
    { key: 'region', label: 'Region' },
    { key: 'type', label: 'Type', render: (v) => <span className="capitalize">{String(v)}</span> },
    { key: 'student_count', label: 'Students', render: (v) => Number(v).toLocaleString() },
  ]

  const uniMap = Object.fromEntries(universities.map((u) => [u.id, u.name]))

  const progColumns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'university_id', label: 'University', render: (v) => uniMap[v as number] ?? `#${v}` },
    { key: 'field', label: 'Field' },
    { key: 'degree_level', label: 'Degree', render: (v) => <span className="capitalize">{String(v)}</span> },
    { key: 'enrolled_students', label: 'Enrolled', render: (v) => Number(v).toLocaleString() },
    { key: 'status', label: 'Status', render: (v) => <span className="capitalize">{String(v).replace('_', ' ')}</span> },
  ]

  const userColumns: Column[] = [
    { key: 'id', label: 'ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (v) => (
        <span
          className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
            v === 'admin'
              ? 'bg-red-100 text-red-700'
              : v === 'analyst'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          )}
        >
          {String(v)}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (v) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {v ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ]

  const uniFields = [
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
    { key: 'region', label: 'Region' },
    { key: 'type', label: 'Type (public/private/research)' },
    { key: 'student_count', label: 'Student Count', type: 'number' },
  ]

  const progFields = [
    { key: 'name', label: 'Name' },
    { key: 'university_id', label: 'University ID', type: 'number' },
    { key: 'field', label: 'Field' },
    { key: 'degree_level', label: 'Degree Level (bachelor/master/phd/associate)' },
    { key: 'enrolled_students', label: 'Enrolled Students', type: 'number' },
    { key: 'graduation_rate', label: 'Graduation Rate (%)', type: 'number' },
    { key: 'status', label: 'Status (active/inactive/under_review)' },
  ]

  return (
    <DashboardLayout title="Admin">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === id ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Universities Tab */}
      {activeTab === 'universities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setModal('addUni'); setEditTarget(null) }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4" /> Add University
            </button>
          </div>
          <DataTable
            columns={uniColumns}
            data={universities as unknown as Record<string, unknown>[]}
            loading={loading}
            onRowClick={(row) => { setEditTarget(row as unknown as University); setModal('editUni') }}
          />
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setModal('addProg'); setEditTarget(null) }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4" /> Add Program
            </button>
          </div>
          <DataTable
            columns={progColumns}
            data={programs as unknown as Record<string, unknown>[]}
            loading={loading}
            onRowClick={(row) => { setEditTarget(row as unknown as Program); setModal('editProg') }}
          />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <DataTable
          columns={userColumns}
          data={users as unknown as Record<string, unknown>[]}
          loading={loading}
        />
      )}

      {/* Ingestion Tab */}
      {activeTab === 'ingestion' && <IngestionTab />}

      {/* Modals */}
      {modal === 'addUni' && (
        <FormModal
          title="Add University"
          fields={uniFields}
          onClose={() => setModal(null)}
          onSubmit={async (data) => {
            await universitiesApi.createUniversity({
              name: data.name,
              country: data.country,
              region: data.region,
              type: data.type as University['type'],
              student_count: Number(data.student_count),
            })
            await fetchAll()
          }}
        />
      )}

      {modal === 'editUni' && editTarget && (
        <FormModal
          title="Edit University"
          fields={uniFields}
          initial={editTarget as unknown as Record<string, unknown>}
          onClose={() => setModal(null)}
          onSubmit={async (data) => {
            await universitiesApi.updateUniversity((editTarget as University).id, {
              name: data.name,
              country: data.country,
              region: data.region,
              type: data.type as University['type'],
              student_count: Number(data.student_count),
            })
            await fetchAll()
          }}
        />
      )}

      {modal === 'addProg' && (
        <FormModal
          title="Add Program"
          fields={progFields}
          onClose={() => setModal(null)}
          onSubmit={async (data) => {
            await programsApi.createProgram({
              name: data.name,
              university_id: Number(data.university_id),
              field: data.field,
              degree_level: data.degree_level as Program['degree_level'],
              enrolled_students: Number(data.enrolled_students),
              graduation_rate: Number(data.graduation_rate),
              status: data.status as Program['status'],
            })
            await fetchAll()
          }}
        />
      )}

      {modal === 'editProg' && editTarget && (
        <FormModal
          title="Edit Program"
          fields={progFields}
          initial={editTarget as unknown as Record<string, unknown>}
          onClose={() => setModal(null)}
          onSubmit={async (data) => {
            await programsApi.updateProgram((editTarget as Program).id, {
              name: data.name,
              university_id: Number(data.university_id),
              field: data.field,
              degree_level: data.degree_level as Program['degree_level'],
              enrolled_students: Number(data.enrolled_students),
              graduation_rate: Number(data.graduation_rate),
              status: data.status as Program['status'],
            })
            await fetchAll()
          }}
        />
      )}
    </DashboardLayout>
  )
}
