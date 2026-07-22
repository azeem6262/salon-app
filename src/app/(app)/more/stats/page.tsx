import { createClient } from '@/lib/supabase/server'
import StatsFilterClient from './StatsFilterClient'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export default async function StatsPage({ searchParams }: { searchParams: { filter?: string, start?: string, end?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user?.id).single()

  const resolvedParams = await searchParams
  const filter = resolvedParams?.filter || 'day'
  
  const today = new Date()
  let startDateStr = ''
  let endDateStr = ''

  if (filter === 'day') {
    startDateStr = format(startOfDay(today), 'yyyy-MM-dd')
    endDateStr = format(endOfDay(today), 'yyyy-MM-dd')
  } else if (filter === 'week') {
    startDateStr = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    endDateStr = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  } else if (filter === 'month') {
    startDateStr = format(startOfMonth(today), 'yyyy-MM-dd')
    endDateStr = format(endOfMonth(today), 'yyyy-MM-dd')
  } else if (filter === 'custom') {
    startDateStr = resolvedParams?.start || format(today, 'yyyy-MM-dd')
    endDateStr = resolvedParams?.end || format(today, 'yyyy-MM-dd')
  }

  // Fetch all bookings for this range
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, price, status, customer_id')
    .eq('org_id', org?.id)
    .gte('booking_date', startDateStr)
    .lte('booking_date', endDateStr)

  // Calculate stats
  let totalSales = 0
  let noShows = 0
  const uniqueClients = new Set()

  bookings?.forEach(b => {
    if (b.status === 'completed') {
      totalSales += Number(b.price)
    }
    if (b.status === 'no_show') {
      noShows++
    }
    uniqueClients.add(b.customer_id)
  })

  const totalBookings = bookings?.length || 0

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-slate-900 ml-2">Dashboard</h2>
      </div>

      <StatsFilterClient />

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Total Sales */}
        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
          <p className="text-xs font-bold text-indigo-600/80 uppercase tracking-wider z-10">Total Sales</p>
          <p className="text-3xl font-bold text-slate-900 z-10">₹{totalSales.toFixed(2)}</p>
        </div>

        {/* Total Bookings */}
        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden bg-gradient-to-br from-teal-50 to-white">
          <p className="text-xs font-bold text-teal-600/80 uppercase tracking-wider z-10">Bookings</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{totalBookings}</p>
        </div>

        {/* Unique Clients */}
        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
          <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider z-10">Unique Clients</p>
          <p className="text-3xl font-bold text-slate-900 z-10">{uniqueClients.size}</p>
        </div>

        {/* No Shows */}
        <div className="glass-card p-5 rounded-[2rem] flex flex-col gap-2 relative overflow-hidden bg-gradient-to-br from-red-50 to-white">
          <p className="text-xs font-bold text-red-600/80 uppercase tracking-wider z-10">No-Shows</p>
          <p className="text-3xl font-bold text-red-600 z-10">{noShows}</p>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-xs font-bold text-slate-400">
          Showing data from <br/>
          <span className="text-slate-600">{startDateStr}</span> to <span className="text-slate-600">{endDateStr}</span>
        </p>
      </div>
    </div>
  )
}
