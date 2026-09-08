export function TopBar({ orgName }: { orgName: string }) {
  return (
    <header className="sticky top-0 z-30 flex flex-col justify-center px-7 py-6 glass-card border-x-0 border-t-0 rounded-b-[2.5rem] shadow-sm mb-2 mx-0 bg-white/70 backdrop-blur-xl border-b border-white">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 bg-white border border-slate-200/90 rounded-xl shadow-sm flex items-center justify-center ring-1 ring-black/5">
          <span className="text-slate-950 font-black text-sm tracking-tight select-none">RL</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">
          Relore
        </h1>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-5 h-[3px] bg-slate-400 rounded-full opacity-70"></div>
        <p className="text-base font-bold text-slate-600 tracking-wide">{orgName}</p>
      </div>
    </header>
  )
}


