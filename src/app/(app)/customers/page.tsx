import { createClient } from '@/lib/supabase/server'
import CustomersClient from './CustomersClient'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user?.id).single()

  const { data: customers } = await supabase
    .from('customers')
    .select(`
      id, name, phone,
      bookings (
        id, service_name_snapshot, stylist_name_snapshot, price, booking_date, time_slot, status, follow_up_note
      )
    `)
    .eq('org_id', org?.id)
    .order('name', { ascending: true })

  // Data processing: calculate last visit and total visits for each customer
  const processedCustomers = customers?.map(customer => {
    // Sort bookings by date descending
    const sortedBookings = customer.bookings.sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime())
    
    // Find last completed or confirmed booking
    const lastBooking = sortedBookings.length > 0 ? sortedBookings[0] : null
    
    // Count total bookings (excluding no_shows, or including all? Let's say all)
    const totalVisits = customer.bookings.length

    return {
      ...customer,
      lastBooking,
      totalVisits,
      sortedBookings
    }
  }) || []

  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-140px)]">
      <div className="sticky top-0 z-10 px-4 py-5 flex items-center justify-between backdrop-blur-md bg-mesh-light/50 -mx-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-900 ml-4">Customers Directory</h2>
      </div>

      <CustomersClient initialCustomers={processedCustomers} />
    </div>
  )
}
