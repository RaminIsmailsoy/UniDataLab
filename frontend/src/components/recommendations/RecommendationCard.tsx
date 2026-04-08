'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import type { Recommendation } from '@/types'

interface Props {
  recommendation: Recommendation
}

const actionConfig: Record<
  Recommendation['action'],
  { label: string; bg: string; text: string }
> = {
  expand: { label: 'Expand', bg: 'bg-green-100', text: 'text-green-700' },
  open: { label: 'Open', bg: 'bg-blue-100', text: 'text-blue-700' },
  monitor: { label: 'Monitor', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  reduce: { label: 'Reduce', bg: 'bg-orange-100', text: 'text-orange-700' },
  close: { label: 'Close', bg: 'bg-red-100', text: 'text-red-700' },
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const color =
    pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={clsx('h-2 rounded-full transition-all', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function RecommendationCard({ recommendation }: Props) {
  const [showFactors, setShowFactors] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const cfg = actionConfig[recommendation.action] ?? actionConfig.monitor

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Program #{recommendation.program_id}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            University #{recommendation.university_id} ·{' '}
            {new Date(recommendation.generated_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={clsx(
            'text-xs font-bold px-3 py-1 rounded-full flex-shrink-0',
            cfg.bg,
            cfg.text
          )}
        >
          {cfg.label}
        </span>
      </div>

      {/* Score */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Score</span>
          <span className="font-semibold">{recommendation.score}/100</span>
        </div>
        <ScoreBar value={recommendation.score} />
      </div>

      {/* Confidence */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Confidence</span>
          <span className="font-semibold">{(recommendation.confidence * 100).toFixed(0)}%</span>
        </div>
        <ScoreBar value={recommendation.confidence * 100} />
      </div>

      {/* Explanation */}
      <div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showExplanation ? 'Hide' : 'Show'} Explanation
          <ChevronDownIcon
            className={clsx('w-3 h-3 transition-transform', showExplanation && 'rotate-180')}
          />
        </button>
        {showExplanation && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {recommendation.explanation}
          </p>
        )}
      </div>

      {/* Factors */}
      {recommendation.factors?.length > 0 && (
        <div>
          <button
            onClick={() => setShowFactors(!showFactors)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showFactors ? 'Hide' : 'Show'} Factors ({recommendation.factors.length})
            <ChevronDownIcon
              className={clsx('w-3 h-3 transition-transform', showFactors && 'rotate-180')}
            />
          </button>
          {showFactors && (
            <ul className="mt-2 space-y-1">
              {recommendation.factors.map((factor, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {factor}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
