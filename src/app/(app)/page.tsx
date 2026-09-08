import DashboardFilters from './DashboardFilters'
import { getDashboardStats } from '@/app/actions/analytics'
import { Suspense } from 'react'
import AddBookingFAB from './AddBookingFAB'

export default async function Home({ searchParams }: { searchParams: Promise<{ range?: string, start?: string, end?: string }> }) {
  const resolvedParams = await searchParams
  const range = resolvedParams?.range || 'day'
  const start = resolvedParams?.start
  const end = resolvedParams?.end

  const stats = await getDashboardStats(range, start, end)

  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-160px)]">
      
      <div className="sticky top-0 z-10 pt-5 pb-3 flex flex-col gap-3 backdrop-blur-md bg-mesh-light/50 -mx-4 px-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-900 ml-2">Dashboard</h2>
        <Suspense fallback={<div className="h-10 bg-white/40 animate-pulse rounded-2xl"></div>}>
          <DashboardFilters />
        </Suspense>
      </div>

      <div className="grid grid-cols-2 gap-4 -mt-2">
        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">Total Sales</p>
          <p className="text-3xl font-bold text-slate-900 z-10">₹{stats.totalSales.toFixed(2)}</p>
        </div>
        
        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">Unique Clients</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{stats.totalClients}</p>
        </div>

        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">Bookings</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{stats.totalBookings}</p>
        </div>

        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">No-Shows</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{stats.noShowCount}</p>
        </div>
      </div>

      <AddBookingFAB />
    </div>
  )
}

