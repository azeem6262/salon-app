import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Scissors, Users, Store, LogOut, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function MorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: org } = await supabase.from('organizations').select('*').eq('owner_user_id', user.id).single()

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-slate-900 ml-2">Settings</h2>

      <div className="flex flex-col glass-card rounded-[2rem] overflow-hidden">
        <Link href="/more/services" className="flex items-center justify-between p-5 border-b border-white/40 hover:bg-white/40 active:bg-white/60 transition-colors touch-scale">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-400 to-teal-500 text-white rounded-2xl shadow-sm shadow-teal-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">Manage Services</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
        <Link href="/more/stylists" className="flex items-center justify-between p-5 border-b border-white/40 hover:bg-white/40 active:bg-white/60 transition-colors touch-scale">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-400 to-indigo-500 text-white rounded-2xl shadow-sm shadow-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">Manage Stylists</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
        <Link href="/more/business" className="flex items-center justify-between p-5 border-b border-white/40 hover:bg-white/40 active:bg-white/60 transition-colors touch-scale">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-2xl shadow-sm shadow-orange-500/20">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800">Business Profile</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
        
        <form action={async () => {
          'use server'
          const supabase = await createClient()
          await supabase.auth.signOut()
          redirect('/login')
        }}>
          <button type="submit" className="flex items-center justify-between w-full p-5 hover:bg-white/40 active:bg-white/60 transition-colors touch-scale">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-2xl shadow-sm shadow-red-500/20">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800">Sign Out</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  )
}
