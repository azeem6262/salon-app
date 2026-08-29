import { createClient } from '@/lib/supabase/server'
import { addService, deleteService } from '@/app/actions/services'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user?.id).limit(1).single()
  const { data: services } = await supabase.from('services').select('*').eq('org_id', org?.id).order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="sticky top-0 z-10 px-4 py-5 flex items-center gap-3 backdrop-blur-md bg-mesh-light/50 -mx-4 mb-4">
        <Link href="/more" className="p-2 bg-white/50 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Manage Services</h2>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-card p-5 rounded-[2rem]">
          <h3 className="font-bold text-slate-900 mb-4">Add New Service</h3>
          <form action={addService} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Name</label>
              <input type="text" name="name" id="name" required placeholder="e.g. Haircut" className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-inner" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Price</label>
              <input type="number" name="price" id="price" required placeholder="0.00" min="0" step="0.01" className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-inner" />
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-400 text-white rounded-xl py-3 mt-2 font-bold shadow-lg shadow-teal-500/30 touch-scale hover:shadow-teal-500/40">
              <Plus className="w-5 h-5" />
              Add Service
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3 pb-8">
          <h3 className="font-bold text-slate-900 ml-2">Your Services</h3>
          {services?.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10 glass-card rounded-[2rem] border-dashed">No services added yet.</p>
          ) : (
            services?.map((service) => (
              <div key={service.id} className="flex items-center justify-between glass-card p-4 rounded-[1.5rem] touch-scale">
                <div>
                  <p className="font-bold text-slate-900">{service.name}</p>
                  <p className="text-sm text-teal-600 font-bold">₹{service.default_price}</p>
                </div>
                <form action={async () => { 'use server'; await deleteService(service.id) }}>
                  <button type="submit" className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

