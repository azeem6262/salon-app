import { createClient } from '@/lib/supabase/server'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import BookingCardClient from './BookingCardClient'

export default async function AppointmentsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user?.id).single()

  // In Next.js 13+ searchParams in page components is actually a promise if you are in React 19/Next 15
  // But wait, depending on the Next.js version, it might be synchronously accessible or a Promise.
  // Next 14.x is synchronous, Next 15 is a Promise. Our user rules say "This version has breaking changes" - Next 15.
  // Let's await searchParams if it's a promise, or safely use it.
  const resolvedParams = await searchParams
  const tab = resolvedParams?.tab || 'upcoming'
  const todayDateStr = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('bookings')
    .select(`
      id, booking_date, time_slot, price, status,
      service_name_snapshot, stylist_name_snapshot,
      customers (name, phone)
    `)
    .eq('org_id', org?.id)

  if (tab === 'upcoming') {
    query = query.gte('booking_date', todayDateStr).eq('status', 'confirmed').order('booking_date', { ascending: true }).order('time_slot', { ascending: true })
  } else {
    // Past or completed/no-show
    query = query.or(`booking_date.lt.${todayDateStr},status.in.(completed,no_show)`).order('booking_date', { ascending: false }).order('time_slot', { ascending: false })
  }

  const { data: bookings } = await query

  // Group bookings by date
  const groupedBookings = bookings?.reduce((acc: any, booking) => {
    if (!acc[booking.booking_date]) {
      acc[booking.booking_date] = []
    }
    acc[booking.booking_date].push(booking)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-140px)]">
      <div className="sticky top-0 z-10 px-4 py-5 flex items-center justify-between backdrop-blur-md bg-mesh-light/50 -mx-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-900 ml-4">Appointments</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/60 p-1 rounded-2xl shadow-sm border border-white/60">
        <Link 
          href="/appointments?tab=upcoming" 
          className={`flex-1 text-center py-3 rounded-xl font-bold transition-all ${tab === 'upcoming' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Upcoming
        </Link>
        <Link 
          href="/appointments?tab=past" 
          className={`flex-1 text-center py-3 rounded-xl font-bold transition-all ${tab === 'past' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Past
        </Link>
      </div>

      <div className="flex flex-col gap-6 pb-20">
        {(!bookings || bookings.length === 0) ? (
          <div className="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border-dashed border-2 border-white/60 h-48 mt-4">
            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-slate-500 font-medium text-center">No appointments found.</p>
          </div>
        ) : (
          Object.keys(groupedBookings || {}).map((date) => (
            <div key={date} className="flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 ml-2">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
              {groupedBookings[date].map((booking: any) => (
                <BookingCardClient key={booking.id} booking={booking} isPast={tab === 'past'} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
