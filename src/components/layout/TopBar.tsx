import { Sparkles } from 'lucide-react'

export function TopBar({ orgName }: { orgName: string }) {
  return (
    <header className="sticky top-0 z-30 flex flex-col justify-center px-7 py-6 glass-card border-x-0 border-t-0 rounded-b-[2.5rem] shadow-sm mb-2 mx-0 bg-white/70 backdrop-blur-xl border-b border-white">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl shadow-md shadow-fuchsia-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent tracking-tighter drop-shadow-sm">
          Salonly
        </h1>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-5 h-[3px] bg-gradient-to-r from-indigo-400 to-fuchsia-400 rounded-full opacity-70"></div>
        <p className="text-base font-bold text-slate-600 tracking-wide">{orgName}</p>
      </div>
    </header>
  )
}


