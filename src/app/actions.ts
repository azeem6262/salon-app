'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const businessType = formData.get('businessType') as string
  const name = formData.get('name') as string

  const { error } = await supabase.from('organizations').insert({
    owner_user_id: user.id,
    name,
    business_type: businessType,
  })

  if (error) {
    console.error('Error creating organization:', error)
    throw new Error('Failed to create organization')
  }

  redirect('/')
}
