import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import ExistingBookingFormClient from './ExistingBookingFormClient'

export default async function ExistingBookingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user.id).limit(1).single()
  
  const { data: services } = await supabase.from('services').select('*').eq('org_id', org?.id).order('name')
  const { data: stylists } = await supabase.from('stylists').select('*').eq('org_id', org?.id).order('name')

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="sticky top-0 z-10 px-4 py-5 flex items-center gap-3 backdrop-blur-md bg-mesh-light/50 -mx-4 mb-4">
        <Link href="/" className="p-2 bg-white/50 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Existing Customer</h2>
      </div>

      <div className="glass-card p-6 rounded-[2rem] shadow-xl">
        <ExistingBookingFormClient services={services || []} stylists={stylists || []} />
      </div>
    </div>
  )
}

