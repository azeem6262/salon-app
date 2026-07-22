'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBusiness(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const businessType = formData.get('businessType') as string

  await supabase.from('organizations').update({
    name,
    business_type: businessType
  }).eq('owner_user_id', user.id)
  
  revalidatePath('/more/business')
  revalidatePath('/')
}
