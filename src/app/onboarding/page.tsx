import { submitOnboarding } from '@/app/actions/onboarding'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: org } = await supabase.from('organizations').select('id').eq('owner_user_id', user.id).limit(1).maybeSingle()
  if (org) redirect('/')

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-mesh-light">
      <div className="w-full max-w-sm flex flex-col gap-10 glass-card p-8 rounded-[2.5rem]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome</h1>
          <p className="mt-2 text-slate-500 font-medium">Let's set up your business.</p>
        </div>

        <form action={submitOnboarding} className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Business Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer group">
                <input type="radio" name="businessType" value="salon" className="peer sr-only" required defaultChecked />
                <div className="rounded-2xl border-2 border-white/50 bg-white/40 p-4 text-center transition-all peer-checked:border-indigo-500 peer-checked:bg-white peer-checked:shadow-md group-hover:bg-white/60 touch-scale">
                  <span className="block font-bold text-slate-800">Salon</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input type="radio" name="businessType" value="clinic" className="peer sr-only" required />
                <div className="rounded-2xl border-2 border-white/50 bg-white/40 p-4 text-center transition-all peer-checked:border-indigo-500 peer-checked:bg-white peer-checked:shadow-md group-hover:bg-white/60 touch-scale">
                  <span className="block font-bold text-slate-800">Clinic</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="name" className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Organisation Name</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              placeholder="What's your business called?" 
              required
              className="w-full rounded-2xl border border-white/60 bg-white/60 px-5 py-4 text-slate-900 font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 touch-scale hover:shadow-indigo-500/40"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}

