import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 relative min-h-[calc(100vh-160px)]">
      <div className="sticky top-0 z-10 pt-5 pb-3 flex flex-col gap-3 -mx-4 px-4 mb-2">
        <div className="h-8 w-48 bg-white/40 animate-pulse rounded-lg ml-2"></div>
      </div>
      
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 rounded-[1.5rem] flex flex-col gap-3 h-24 animate-pulse">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-white/50 rounded-2xl"></div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 w-1/2 bg-white/50 rounded"></div>
                <div className="h-3 w-1/3 bg-white/50 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white/60 p-4 rounded-full shadow-lg backdrop-blur-md">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    </div>
  )
}

