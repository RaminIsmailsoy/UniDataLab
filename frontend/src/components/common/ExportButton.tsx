'use client'

import { useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { reportsApi } from '@/lib/api'
import clsx from 'clsx'

interface Props {
  type: 'csv' | 'pdf'
  filename?: string
}

export default function ExportButton({ type, filename }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  async function handleExport() {
    setLoading(true)
    setStatus('idle')
    try {
      const blob = type === 'csv' ? await reportsApi.exportCSV() : await reportsApi.exportPDF()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? `unidatalab-report.${type}`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className={clsx(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
          type === 'csv'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        )}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <ArrowDownTrayIcon className="w-4 h-4" />
        )}
        {loading ? 'Exporting…' : `Export ${type.toUpperCase()}`}
      </button>
      {status === 'success' && (
        <p className="text-xs text-green-600 font-medium">✓ Downloaded successfully</p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-600 font-medium">✗ Export failed. Please try again.</p>
      )}
    </div>
  )
}
