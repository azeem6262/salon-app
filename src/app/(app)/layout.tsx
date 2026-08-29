import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching org in AppShell:', error)
  }

  if (!org) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-mesh-light pb-24 max-w-md mx-auto w-full shadow-2xl relative overflow-x-hidden">
      <TopBar orgName={org.name} />
      <main className="flex-1 w-full px-4 pt-4 pb-8 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
