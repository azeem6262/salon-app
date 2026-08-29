import { createClient } from '@/lib/supabase/server'
import { updateBusiness } from '@/app/actions/business'
import { ChevronLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default async function BusinessProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: org } = await supabase.from('organizations').select('*').eq('owner_user_id', user?.id).limit(1).single()

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="sticky top-0 bg-slate-50 z-10 px-4 py-4 flex items-center gap-3">
        <Link href="/more" className="p-2 -ml-2 text-slate-500 hover:text-slate-900">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Business Profile</h2>
      </div>

      <div className="px-4 flex flex-col gap-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <form action={updateBusiness} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-600">Business Type</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" name="businessType" value="salon" defaultChecked={org?.business_type === 'salon'} className="peer sr-only" required />
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center hover:bg-slate-50 peer-checked:border-orange-500 peer-checked:ring-1 peer-checked:ring-orange-500">
                    <span className="block font-medium text-slate-900">Salon</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="businessType" value="clinic" defaultChecked={org?.business_type === 'clinic'} className="peer sr-only" required />
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center hover:bg-slate-50 peer-checked:border-orange-500 peer-checked:ring-1 peer-checked:ring-orange-500">
                    <span className="block font-medium text-slate-900">Clinic</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm text-slate-600">Organisation Name</label>
              <input type="text" name="name" id="name" defaultValue={org?.name} required placeholder="Business Name" className="rounded-xl border border-slate-200 px-3 py-3 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none" />
            </div>
            
            <button type="submit" className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl py-3 mt-2 font-medium hover:bg-orange-600 active:scale-95 transition-transform">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

