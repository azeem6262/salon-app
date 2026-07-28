'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

async function getOrg() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user.id).single()
  if (!org) throw new Error('No organization found')
  return { supabase, orgId: org.id, userId: user.id }
}

export async function getDashboardStats(range: string = 'day', customStart?: string, customEnd?: string) {
  const { supabase, orgId } = await getOrg()

  let startDate: string
  let endDate: string
  const today = new Date()

  switch (range) {
    case 'week':
      startDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      endDate = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      break
    case 'month':
      startDate = format(startOfMonth(today), 'yyyy-MM-dd')
      endDate = format(endOfMonth(today), 'yyyy-MM-dd')
      break
    case 'custom':
      startDate = customStart || format(today, 'yyyy-MM-dd')
      endDate = customEnd || format(today, 'yyyy-MM-dd')
      break
    case 'day':
    default:
      startDate = format(today, 'yyyy-MM-dd')
      endDate = format(today, 'yyyy-MM-dd')
      break
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, price, status, customer_id')
    .eq('org_id', orgId)
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)

  if (error) {
    console.error("Error fetching stats:", error)
    return {
      totalSales: 0,
      totalClients: 0,
      totalBookings: 0,
      noShowCount: 0,
    }
  }

  let totalSales = 0
  let noShowCount = 0
  const uniqueClients = new Set<string>()

  bookings?.forEach((b) => {
    if (b.status === 'completed') {
      totalSales += Number(b.price)
    }
    if (b.status === 'no_show') {
      noShowCount++
    }
    if (b.customer_id) {
      uniqueClients.add(b.customer_id)
    }
  })

  return {
    totalSales,
    totalClients: uniqueClients.size,
    totalBookings: bookings?.length || 0,
    noShowCount,
  }
}
