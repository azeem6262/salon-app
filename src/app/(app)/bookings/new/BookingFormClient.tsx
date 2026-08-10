'use client'

import { useState } from 'react'
import { addBooking } from '@/app/actions/bookings'
import { Check } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function BookingFormClient({ services, stylists }: { services: any[], stylists: any[] }) {
  const router = useRouter()
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [price, setPrice] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  
  const [serviceSearch, setServiceSearch] = useState('')
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
  const filteredServices = services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))

  const toggleService = (s: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(x => x.id === s.id)
      const next = isSelected ? prev.filter(x => x.id !== s.id) : [...prev, s]
      const newPrice = next.reduce((sum, curr) => sum + curr.default_price, 0)
      setPrice(newPrice)
      return next
    })
  }

  const validateAndSubmit = async (formData: FormData) => {
    const phone = formData.get('customerPhone') as string
    
    // Basic validation: if phone is provided, it should be mostly numbers and 10-15 chars long.
    // Adjust this regex as needed for your specific country codes.
    if (phone) {
      const numericPhone = phone.replace(/\D/g, '')
      if (numericPhone.length !== 10) {
        setPhoneError('Please enter a valid 10-digit mobile number.')
        return
      }
    }
    
    if (selectedServices.length === 0) {
      return // Prevent submission if no services selected
    }
    
    setPhoneError(null)
    setIsSubmitting(true)
    try {
      const res = await addBooking(formData)
      if (res?.success) {
        router.push('/')
      }
    } catch (e) {
      // If it fails, enable the button again
      setIsSubmitting(false)
      throw e
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await validateAndSubmit(formData)
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</label>
        <input type="text" name="customerName" required placeholder="e.g. John Doe" className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
        <input 
          type="tel" 
          name="customerPhone" 
          required
          placeholder="e.g. 5550123456" 
          onChange={() => setPhoneError(null)}
          className={`rounded-xl border bg-white/60 px-4 py-3 focus:ring-2 outline-none transition-all shadow-inner ${phoneError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-white/60 focus:ring-indigo-500 focus:border-indigo-500'}`} 
        />
        {phoneError && <span className="text-xs font-bold text-red-500 ml-1">{phoneError}</span>}
      </div>

      <div className="flex flex-col gap-2 relative z-20">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Services</label>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search and select services..." 
            value={serviceSearch}
            onChange={(e) => {
              setServiceSearch(e.target.value)
              setIsServiceDropdownOpen(true)
            }}
            onFocus={() => setIsServiceDropdownOpen(true)}
            className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner"
          />
          
          {isServiceDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-56 overflow-y-auto z-30 flex flex-col">
              {filteredServices.length > 0 ? filteredServices.map(s => {
                const isSelected = selectedServices.some(x => x.id === s.id)
                return (
                  <div 
                    key={s.id}
                    onClick={() => toggleService(s)}
                    className={`px-4 py-3 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0 hover:bg-indigo-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'font-bold text-indigo-700' : 'font-medium text-slate-700'}`}>{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">₹{s.default_price}</span>
                  </div>
                )
              }) : (
                <div className="px-4 py-4 text-sm text-slate-500 text-center font-medium">No services found.</div>
              )}
              
              <div 
                className="sticky bottom-0 bg-slate-50/95 backdrop-blur-sm border-t border-slate-100 text-center py-3 text-sm font-bold text-indigo-600 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setIsServiceDropdownOpen(false)}
              >
                Close List
              </div>
            </div>
          )}
        </div>

        {selectedServices.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedServices.map(s => (
              <div key={s.id} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                <span>{s.name}</span>
                <button type="button" onClick={() => toggleService(s)} className="text-indigo-400 hover:text-indigo-700 ml-1 p-0.5 rounded-full hover:bg-indigo-200 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedServices.map(s => (
          <input key={s.id} type="hidden" name="serviceIds" value={s.id} />
        ))}
        {selectedServices.length === 0 && <span className="text-xs font-bold text-red-500">Please select at least one service.</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Provider</label>
        <select name="stylistId" required className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none">
          <option value="">Select a provider...</option>
          {stylists.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
          <input type="date" name="bookingDate" required defaultValue={format(new Date(), 'yyyy-MM-dd')} className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time (Optional)</label>
          <input type="time" name="bookingTime" className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
        <input type="number" name="price" required min="0" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes (Optional)</label>
        <textarea name="notes" rows={2} placeholder="Any special requests..." className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner resize-none"></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || selectedServices.length === 0}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl py-4 mt-2 font-bold shadow-lg shadow-indigo-500/30 touch-scale hover:shadow-indigo-500/40 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : (
          <>
            <Check className="w-5 h-5 stroke-[3px]" />
            Confirm Booking
          </>
        )}
      </button>
    </form>
  )
}
