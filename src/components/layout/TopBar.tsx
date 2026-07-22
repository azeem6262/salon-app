export function TopBar({ orgName }: { orgName: string }) {
  return (
    <header className="sticky top-0 z-30 flex flex-col justify-center px-6 py-5 glass-card border-x-0 border-t-0 rounded-b-[2rem] shadow-sm mb-2 mx-0">
      <h1 className="text-2xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent leading-tight tracking-tight">Salonly</h1>
      <p className="text-sm font-medium text-slate-500 leading-tight mt-1">{orgName}</p>
    </header>
  )
}
