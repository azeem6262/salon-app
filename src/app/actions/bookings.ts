'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getOrg() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user.id).single()
  if (!org) throw new Error('No organization found')
  return { supabase, orgId: org.id, userId: user.id }
}

export async function addBooking(formData: FormData) {
  const { supabase, orgId, userId } = await getOrg()
  
  const customerName = formData.get('customerName') as string
  const customerPhone = formData.get('customerPhone') as string
  const serviceId = formData.get('serviceId') as string
  const stylistId = formData.get('stylistId') as string
  const bookingDate = formData.get('bookingDate') as string
  const bookingTime = formData.get('bookingTime') as string
  const price = parseFloat(formData.get('price') as string)
  const notes = formData.get('notes') as string

  // Parse time and date properly to a UTC timestamptz
  const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`).toISOString()

  // 1. Check if customer exists by phone in this org
  let customerId = ''
  
  if (customerPhone) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('org_id', orgId)
      .eq('phone', customerPhone)
      .maybeSingle()
      
    if (existingCustomer) {
      customerId = existingCustomer.id
    }
  }

  // 2. If customer doesn't exist, create them
  if (!customerId) {
    const { data: newCustomer, error: custErr } = await supabase
      .from('customers')
      .insert({
        org_id: orgId,
        name: customerName,
        phone: customerPhone || `Unknown-${Date.now()}`
      })
      .select('id')
      .single()
      
    if (custErr || !newCustomer) {
      console.error("Customer Insert Error:", custErr)
      throw new Error('Failed to create customer: ' + custErr?.message)
    }
    customerId = newCustomer.id
  }

  // Get snapshots
  const { data: service } = await supabase.from('services').select('name').eq('id', serviceId).single()
  const { data: stylist } = await supabase.from('stylists').select('name').eq('id', stylistId).single()

  // 3. Create the booking
  const { error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      org_id: orgId,
      customer_id: customerId,
      service_id: serviceId,
      service_name_snapshot: service?.name || 'Unknown Service',
      stylist_id: stylistId,
      stylist_name_snapshot: stylist?.name || 'Unknown Stylist',
      price,
      booking_date: bookingDate,
      time_slot: bookingTime,
      status: 'confirmed',
      follow_up_note: notes || null
    })

  if (bookingErr) {
    console.error("Booking Insert Error:", bookingErr)
    throw new Error('Failed to create booking: ' + bookingErr.message)
  }

  revalidatePath('/')
  revalidatePath('/appointments')
  redirect('/')
}
