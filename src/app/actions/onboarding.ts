'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const businessType = formData.get('businessType') as string
  const name = formData.get('name') as string

  // Prevent creating duplicates if they click multiple times
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existingOrg) {
    revalidatePath('/', 'layout')
    redirect('/')
  }

  const { error } = await supabase.from('organizations').insert({
    owner_user_id: user.id,
    name,
    business_type: businessType,
  })

  if (error) {
    console.error('Error creating organization:', error)
    throw new Error('Failed to create organization')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
