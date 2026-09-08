'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getOrg() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user.id).limit(1).single()
  if (!org) throw new Error('No organization found')
  return { supabase, orgId: org.id, userId: user.id }
}

export async function addBooking(formData: FormData) {
  const { supabase, orgId, userId } = await getOrg()
  
  const customerName = formData.get('customerName') as string
  const customerPhone = formData.get('customerPhone') as string
  const serviceIds = formData.getAll('serviceIds') as string[]
  const stylistId = formData.get('stylistId') as string
  const bookingDate = formData.get('bookingDate') as string
  const bookingTime = formData.get('bookingTime') as string
  const price = parseFloat(formData.get('price') as string)
  const notes = formData.get('notes') as string

  // No need to parse time and date since they are saved separately.
  // 1. Check if customer exists by ID or phone in this org
  let customerId = formData.get('customerId') as string
  
  if (!customerId && customerPhone) {
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
    if (!customerPhone) {
      throw new Error('Phone number is required for new customers')
    }
    const { data: newCustomer, error: custErr } = await supabase
      .from('customers')
      .insert({
        org_id: orgId,
        name: customerName,
        phone: customerPhone
      })
      .select('id')
      .single()
      
    if (custErr || !newCustomer) {
      console.error("Customer Insert Error:", custErr)
      throw new Error('Failed to create customer: ' + custErr?.message)
    }
    customerId = newCustomer.id
  }

  // Get snapshots (parallelized)
  const [servicesResponse, stylistResponse] = await Promise.all([
    supabase.from('services').select('name').in('id', serviceIds),
    supabase.from('stylists').select('name').eq('id', stylistId).single()
  ])
  
  const services = servicesResponse.data
  const serviceNameSnapshot = services?.map(s => s.name).join(' + ') || 'Unknown Service'
  const stylist = stylistResponse.data

  // 3. Create the booking
  const { error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      org_id: orgId,
      customer_id: customerId,
      service_id: serviceIds[0] || null,
      service_ids: serviceIds,
      service_name_snapshot: serviceNameSnapshot,
      stylist_id: stylistId,
      stylist_name_snapshot: stylist?.name || 'Unknown Provider',
      price,
      booking_date: bookingDate,
      time_slot: bookingTime || 'TBD',
      status: 'confirmed',
      follow_up_note: notes || null
    })

  if (bookingErr) {
    console.error("Booking Insert Error:", bookingErr)
    throw new Error('Failed to create booking: ' + bookingErr.message)
  }

  revalidatePath('/', 'layout')
  
  return { success: true }
}

export async function updateBookingStatus(id: string, status: string) {
  const { supabase, orgId } = await getOrg()
  
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .match({ id, org_id: orgId })

  if (error) {
    console.error("Booking Update Error:", error)
    throw new Error('Failed to update booking status: ' + error.message)
  }

  revalidatePath('/', 'layout')
}

export async function deleteBooking(id: string) {
  const { supabase, orgId } = await getOrg()

  const { error } = await supabase
    .from('bookings')
    .delete()
    .match({ id, org_id: orgId })

  if (error) {
    console.error("Booking Delete Error:", error)
    throw new Error('Failed to delete booking: ' + error.message)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateBooking(id: string, formData: FormData) {
  const { supabase, orgId } = await getOrg()

  const serviceIds = formData.getAll('serviceIds') as string[]
  const stylistId = formData.get('stylistId') as string
  const bookingDate = formData.get('bookingDate') as string
  const bookingTime = formData.get('bookingTime') as string
  const price = parseFloat(formData.get('price') as string)
  const status = formData.get('status') as string
  const notes = formData.get('notes') as string

  // Parallel fetch snapshots if needed
  const [servicesResponse, stylistResponse] = await Promise.all([
    serviceIds.length > 0 ? supabase.from('services').select('name').in('id', serviceIds) : Promise.resolve({ data: [] }),
    stylistId ? supabase.from('stylists').select('name').eq('id', stylistId).maybeSingle() : Promise.resolve({ data: null })
  ])

  const serviceNameSnapshot = servicesResponse.data && servicesResponse.data.length > 0
    ? servicesResponse.data.map((s: any) => s.name).join(' + ')
    : undefined
  const stylistNameSnapshot = stylistResponse.data?.name

  const updatePayload: any = {
    booking_date: bookingDate,
    time_slot: bookingTime || 'TBD',
    price: isNaN(price) ? 0 : price,
    updated_at: new Date().toISOString()
  }

  if (status) updatePayload.status = status
  if (serviceIds.length > 0) {
    updatePayload.service_ids = serviceIds
    updatePayload.service_id = serviceIds[0]
  }
  if (serviceNameSnapshot) updatePayload.service_name_snapshot = serviceNameSnapshot
  if (stylistId) updatePayload.stylist_id = stylistId
  if (stylistNameSnapshot) updatePayload.stylist_name_snapshot = stylistNameSnapshot
  if (notes !== undefined) updatePayload.follow_up_note = notes || null

  const { error } = await supabase
    .from('bookings')
    .update(updatePayload)
    .match({ id, org_id: orgId })

  if (error) {
    console.error("Booking Update Error:", error)
    throw new Error('Failed to update booking: ' + error.message)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

