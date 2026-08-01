'use client'

import { useState } from 'react'
import { addBooking } from '@/app/actions/bookings'
import { Check } from 'lucide-react'
import { format } from 'date-fns'

export default function BookingFormClient({ services, stylists }: { services: any[], stylists: any[] }) {
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const [price, setPrice] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)

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
      await addBooking(formData)
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
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone (Optional)</label>
        <input 
          type="tel" 
          name="customerPhone" 
          placeholder="e.g. 5550123456" 
          onChange={() => setPhoneError(null)}
          className={`rounded-xl border bg-white/60 px-4 py-3 focus:ring-2 outline-none transition-all shadow-inner ${phoneError ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-white/60 focus:ring-indigo-500 focus:border-indigo-500'}`} 
        />
        {phoneError && <span className="text-xs font-bold text-red-500 ml-1">{phoneError}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Services</label>
        <div className="flex flex-wrap gap-2">
          {services.map(s => {
            const isSelected = selectedServices.some(x => x.id === s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-white/60 text-slate-700 border-white/60 hover:bg-white touch-scale'}`}
              >
                {s.name} (₹{s.default_price})
              </button>
            )
          })}
        </div>
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
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</label>
          <input type="time" name="bookingTime" required className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner" />
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
