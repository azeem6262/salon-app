'use client'

import { useState } from 'react'
import { Plus, UserPlus, Search } from 'lucide-react'
import Link from 'next/link'

export default function AddBookingFAB() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 pointer-events-auto transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-50 flex justify-end px-6">
        <div className="relative pointer-events-auto flex flex-col items-end">
          {/* Menu */}
          <div className={`absolute bottom-16 right-0 flex flex-col items-end gap-3 transition-all duration-300 origin-bottom-right mb-2 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
            <Link 
              href="/bookings/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-end gap-3 bg-white pl-5 pr-2 py-2 rounded-full shadow-xl border border-indigo-100 touch-scale group"
            >
              <span className="font-bold text-slate-700 whitespace-nowrap">New Customer</span>
              <div className="bg-indigo-100 p-2.5 rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                <UserPlus className="w-5 h-5" />
              </div>
            </Link>
            
            <Link 
              href="/bookings/existing"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-end gap-3 bg-white pl-5 pr-2 py-2 rounded-full shadow-xl border border-fuchsia-100 touch-scale group"
            >
              <span className="font-bold text-slate-700 whitespace-nowrap">Existing Customer</span>
              <div className="bg-fuchsia-100 p-2.5 rounded-full text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors shadow-sm">
                <Search className="w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Main Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-fuchsia-500 text-white w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] touch-scale hover:shadow-[0_8px_30px_rgb(99,102,241,0.6)] transition-all duration-300 ${isOpen ? 'rotate-45' : 'hover:-translate-y-1'}`}
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>
      </div>
    </>
  )
}
