'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Calendar } from 'lucide-react'

export default function StatsFilterClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentFilter = searchParams.get('filter') || 'day'
  const currentStart = searchParams.get('start') || ''
  const currentEnd = searchParams.get('end') || ''

  const [isCustomOpen, setIsCustomOpen] = useState(currentFilter === 'custom')
  const [startDate, setStartDate] = useState(currentStart)
  const [endDate, setEndDate] = useState(currentEnd)

  const handleFilterChange = (filter: string) => {
    if (filter === 'custom') {
      setIsCustomOpen(true)
    } else {
      setIsCustomOpen(false)
      router.push(`/more/stats?filter=${filter}`)
    }
  }

  const applyCustomDates = () => {
    if (startDate && endDate) {
      router.push(`/more/stats?filter=custom&start=${startDate}&end=${endDate}`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Segmented Control */}
      <div className="flex bg-white/60 p-1 rounded-2xl shadow-sm border border-white/60">
        {['day', 'week', 'month', 'custom'].map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`flex-1 text-center py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${
              currentFilter === f 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Custom Date Picker Dropdown */}
      {isCustomOpen && (
        <div className="glass-card p-4 rounded-[1.5rem] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex gap-3 items-center">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <button 
            onClick={applyCustomDates}
            disabled={!startDate || !endDate}
            className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl mt-1 disabled:opacity-50"
          >
            Apply Range
          </button>
        </div>
      )}
    </div>
  )
}
