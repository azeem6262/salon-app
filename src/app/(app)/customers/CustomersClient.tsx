'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, User, Phone } from 'lucide-react'

export default function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredCustomers = initialCustomers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  )

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null)
    else setExpandedId(id)
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name or phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/60 bg-white/60 pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border-dashed border-2 border-white/60 h-48 mt-4">
          <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-slate-400">
            <User className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-medium text-center">No customers found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredCustomers.map(customer => {
            const isExpanded = expandedId === customer.id
            const hasPhone = customer.phone && !customer.phone.startsWith('Unknown-')

            return (
              <div key={customer.id} className="glass-card rounded-[1.5rem] overflow-hidden transition-all duration-300">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer touch-scale"
                  onClick={() => toggleExpand(customer.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{customer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {hasPhone && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {customer.phone}
                        </span>
                      )}
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {customer.totalVisits} visits
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {hasPhone && (
                      <a 
                        href={`tel:${customer.phone}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 bg-white/60 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <button className="p-2 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/60 bg-white/30 p-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Booking History</h4>
                    
                    {customer.sortedBookings.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No bookings found.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {customer.sortedBookings.map((booking: any) => (
                          <div key={booking.id} className="flex justify-between items-center bg-white/60 p-3 rounded-xl shadow-sm">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-bold text-slate-900">
                                  {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  booking.status === 'completed' ? 'text-teal-600 bg-teal-50 border-teal-100' :
                                  booking.status === 'no_show' ? 'text-red-600 bg-red-50 border-red-100' :
                                  'text-slate-600 bg-slate-50 border-slate-100'
                                }`}>
                                  {booking.status.toUpperCase().replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-500">{booking.service_name_snapshot} • {booking.stylist_name_snapshot}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-teal-600 text-sm">₹{booking.price}</p>
                              <p className="text-xs font-bold text-indigo-600">{booking.time_slot}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
