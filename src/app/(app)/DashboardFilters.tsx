'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'

export default function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentRange = searchParams.get('range') || 'day'
  const currentStart = searchParams.get('start') || ''
  const currentEnd = searchParams.get('end') || ''

  const [range, setRange] = useState(currentRange)
  const [customStart, setCustomStart] = useState(currentStart)
  const [customEnd, setCustomEnd] = useState(currentEnd)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('range', range)
    
    if (range === 'custom') {
      if (customStart) params.set('start', customStart)
      if (customEnd) params.set('end', customEnd)
    } else {
      params.delete('start')
      params.delete('end')
    }
    
    // Check if URL actually changed to prevent infinite loops
    const currentQuery = searchParams.toString()
    const newQuery = params.toString()
    if (currentQuery !== newQuery) {
      router.push(`/?${newQuery}`)
    }
  }, [range, customStart, customEnd, router, searchParams])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex bg-white/60 p-1 rounded-2xl shadow-sm border border-white/60">
        {['day', 'week', 'month', 'custom'].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 text-center py-2 rounded-xl font-bold transition-all text-sm capitalize ${
              range === r 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {range === 'custom' && (
        <div className="flex gap-2 bg-white/40 p-2 rounded-2xl border border-white/60">
          <div className="flex-1 flex items-center bg-white/60 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="date" 
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none w-full font-medium"
            />
          </div>
          <div className="flex-1 flex items-center bg-white/60 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="date" 
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none w-full font-medium"
            />
          </div>
        </div>
      )}
    </div>
  )
}

