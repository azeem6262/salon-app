import { createClient } from '@/lib/supabase/server'
import { Plus, Calendar, DollarSign, Users, UserX } from 'lucide-react'
import Link from 'next/link'
import DashboardFilters from './DashboardFilters'
import { getDashboardStats } from '@/app/actions/analytics'
import { Suspense } from 'react'

export default async function Home({ searchParams }: { searchParams: Promise<{ range?: string, start?: string, end?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user?.id).single()

  const resolvedParams = await searchParams
  const range = resolvedParams?.range || 'day'
  const start = resolvedParams?.start
  const end = resolvedParams?.end

  const stats = await getDashboardStats(range, start, end)

  const todayDateStr = new Date().toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, booking_date, time_slot, price, status,
      service_name_snapshot, stylist_name_snapshot,
      customers (name)
    `)
    .eq('org_id', org?.id)
    .eq('booking_date', todayDateStr)
    .order('time_slot', { ascending: true })

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
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <DollarSign className="w-20 h-20" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">Total Sales</p>
          <p className="text-3xl font-bold text-slate-900 z-10">₹{stats.totalSales.toFixed(2)}</p>
        </div>
        
        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <Users className="w-20 h-20" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">Total Clients</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{stats.totalClients}</p>
        </div>

        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <Calendar className="w-20 h-20" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">Bookings</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{stats.totalBookings}</p>
        </div>

        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <UserX className="w-20 h-20" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider z-10">No-Shows</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{stats.noShowCount}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <h2 className="text-xl font-bold text-slate-900 ml-2">Today's Schedule</h2>
        
        {bookings?.length === 0 ? (
          <div className="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border-dashed border-2 border-white/60 h-48">
            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-slate-500 font-medium text-center">No appointments today.<br/>Enjoy your free time!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings?.map((booking) => (
              <div key={booking.id} className="glass-card p-4 rounded-[1.5rem] flex gap-4 items-center touch-scale">
                <div className="flex flex-col items-center justify-center bg-white/60 w-16 h-16 rounded-2xl shadow-sm border border-white/60">
                  <span className="text-lg font-bold text-indigo-600">{booking.time_slot}</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-lg">{(booking.customers as any)?.name}</p>
                  <p className="text-sm font-medium text-slate-500">{booking.service_name_snapshot} • {booking.stylist_name_snapshot}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-600">₹{booking.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 left-0 right-0 flex justify-center z-20 mt-auto">
        <Link 
          href="/bookings/new"
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-indigo-500/40 touch-scale hover:shadow-indigo-500/50"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          Add Booking
        </Link>
      </div>
    </div>
  )
}
