'use server'

import { createClient } from '@/lib/supabase/server'

async function getOrg() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user.id).limit(1).single()
  if (!org) throw new Error('No organization found')
  return { supabase, orgId: org.id, userId: user.id }
}

export async function searchCustomers(query: string) {
  if (!query || query.length < 2) return []
  
  const { supabase, orgId } = await getOrg()
  
  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, name, phone')
    .eq('org_id', orgId)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(10)
    
  if (error) {
    console.error("Search Customers Error:", error)
    return []
  }
  
  return customers
}

