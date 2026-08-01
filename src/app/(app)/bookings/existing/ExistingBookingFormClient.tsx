'use client'

import { useState, useEffect, useRef } from 'react'
import { addBooking } from '@/app/actions/bookings'
import { searchCustomers } from '@/app/actions/customers'
import { Check, Search, X, User } from 'lucide-react'

export default function ExistingBookingFormClient({ services, stylists }: { services: any[], stylists: any[] }) {
  const [selectedService, setSelectedService] = useState<any>(null)
  const [price, setPrice] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true)
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchCustomers(searchQuery)
        setSearchResults(results)
        setIsSearching(false)
      }, 300)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value
    const s = services.find(x => x.id === sId)
    setSelectedService(s)
    if (s) {
      setPrice(s.default_price)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCustomer) return
    
    const formData = new FormData(e.currentTarget)
    formData.append('customerId', selectedCustomer.id)
    
    setIsSubmitting(true)
    try {
      await addBooking(formData)
    } catch (e) {
      setIsSubmitting(false)
      throw e
    }
  }

  return (
    <div className="flex flex-col gap-6">
      
      {!selectedCustomer ? (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Customer</label>
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone..." 
              className="w-full rounded-xl border border-white/60 bg-white/60 pl-11 pr-4 py-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all shadow-inner" 
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            {isSearching && (
              <div className="absolute right-4 top-3.5 w-5 h-5 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto pr-1">
              {searchResults.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="flex items-center gap-3 p-3 bg-white/60 hover:bg-white rounded-xl border border-white transition-all text-left group"
                >
                  <div className="bg-fuchsia-100 p-2 rounded-lg text-fuchsia-600 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{customer.name}</span>
                    <span className="text-xs font-medium text-slate-500">{customer.phone}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="p-4 text-center text-sm font-medium text-slate-500 bg-white/40 rounded-xl border border-dashed border-slate-300">
              No customers found.
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center justify-between p-4 bg-fuchsia-50/80 rounded-xl border border-fuchsia-100">
            <div className="flex items-center gap-3">
              <div className="bg-fuchsia-200 p-2 rounded-lg text-fuchsia-700">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-fuchsia-600 uppercase tracking-wider">Selected Customer</span>
                <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                <span className="text-xs font-medium text-slate-500">{selectedCustomer.phone}</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedCustomer(null)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service</label>
            <select name="serviceId" required onChange={handleServiceChange} className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all shadow-inner appearance-none">
              <option value="">Select a service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} - ₹{s.default_price}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Provider</label>
            <select name="stylistId" required className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all shadow-inner appearance-none">
              <option value="">Select a provider...</option>
              {stylists.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
              <input type="date" name="bookingDate" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all shadow-inner" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</label>
              <input type="time" name="bookingTime" required className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all shadow-inner" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
            <input type="number" name="price" required min="0" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all shadow-inner" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes (Optional)</label>
            <textarea name="notes" rows={2} placeholder="Any special requests..." className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all shadow-inner resize-none"></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white rounded-xl py-4 mt-2 font-bold shadow-lg shadow-fuchsia-500/30 touch-scale hover:shadow-fuchsia-500/40 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                <Check className="w-5 h-5 stroke-[3px]" />
                Confirm Booking
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
