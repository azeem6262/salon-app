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

export async function addService(formData: FormData) {
  const { supabase, orgId, userId } = await getOrg()
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)

  const { error } = await supabase.from('services').insert({
    org_id: orgId,
    name,
    default_price: price,
    created_by: 'manual'
  })
  
  if (error) {
    console.error("Supabase insert error:", error)
    throw new Error(error.message)
  }
  
  revalidatePath('/more/services')
}

export async function deleteService(id: string) {
  const { supabase, orgId } = await getOrg()
  await supabase.from('services').delete().match({ id, org_id: orgId })
  revalidatePath('/more/services')
}

