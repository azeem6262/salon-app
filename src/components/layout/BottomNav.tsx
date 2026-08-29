'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Users, MoreHorizontal } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { name: 'Today', href: '/', icon: Home },
    { name: 'Appointments', href: '/appointments', icon: CalendarDays },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'More', href: '/more', icon: MoreHorizontal },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 pointer-events-none flex flex-col justify-end h-32">
      {/* Fade mask behind the nav to smoothly hide scrolling text */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/90 to-transparent -z-10" />
      
      <div className="px-4 pb-6 pt-2">
        <div className="flex items-center justify-around glass-card rounded-[2rem] py-2 px-2 shadow-xl border border-white/80 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full py-2 gap-1 touch-scale rounded-2xl transition-all duration-300 ${
                isActive ? 'text-indigo-600 bg-indigo-50/50 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.name}</span>
            </Link>
          )
        })}
        </div>
      </div>
    </nav>
  )
}

