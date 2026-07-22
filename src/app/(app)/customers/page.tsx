export default function CustomersPage() {
  return (
    <div className="flex flex-col h-[50vh] items-center justify-center gap-4">
      <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center shadow-sm border border-white">
        <span className="text-2xl">👥</span>
      </div>
      <h2 className="text-xl font-bold text-slate-800">Customers</h2>
      <p className="text-slate-500 font-medium text-center">Your customer list will appear here.</p>
    </div>
  )
}
