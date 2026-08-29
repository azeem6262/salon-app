import { createClient } from '@/lib/supabase/server'
import { addProvider, deleteProvider } from '@/app/actions/providers'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default async function ProvidersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user?.id).limit(1).single()
  const { data: providers } = await supabase.from('stylists').select('*').eq('org_id', org?.id).order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="sticky top-0 z-10 px-4 py-5 flex items-center gap-3 backdrop-blur-md bg-mesh-light/50 -mx-4 mb-4">
        <Link href="/more" className="p-2 bg-white/50 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Manage Service Providers</h2>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-card p-5 rounded-[2rem]">
          <h3 className="font-bold text-slate-900 mb-4">Add New Service Provider</h3>
          <form action={addProvider} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider Name</label>
              <input type="text" name="name" id="name" required placeholder="e.g. Sarah" className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner" />
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-400 text-white rounded-xl py-3 mt-2 font-bold shadow-lg shadow-indigo-500/30 touch-scale hover:shadow-indigo-500/40">
              <Plus className="w-5 h-5" />
              Add Service Provider
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3 pb-8">
          <h3 className="font-bold text-slate-900 ml-2">Your Service Providers</h3>
          {providers?.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10 glass-card rounded-[2rem] border-dashed">No service providers added yet.</p>
          ) : (
            providers?.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between glass-card p-4 rounded-[1.5rem] touch-scale">
                <div>
                  <p className="font-bold text-slate-900">{provider.name}</p>
                </div>
                <form action={async () => { 'use server'; await deleteProvider(provider.id) }}>
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

