'use client'

import { useState } from 'react'
import { addBooking } from '@/app/actions/bookings'
import { Check } from 'lucide-react'

export default function BookingFormClient({ services, stylists }: { services: any[], stylists: any[] }) {
  const [selectedService, setSelectedService] = useState<any>(null)
  const [price, setPrice] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value
    const s = services.find(x => x.id === sId)
    setSelectedService(s)
    if (s) {
      setPrice(s.default_price)
    }
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
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service</label>
        <select name="serviceId" required onChange={handleServiceChange} className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none">
          <option value="">Select a service...</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name} - ₹{s.default_price}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stylist</label>
        <select name="stylistId" required className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none">
          <option value="">Select a stylist...</option>
          {stylists.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
          <input type="date" name="bookingDate" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl border border-white/60 bg-white/60 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-inner" />
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
        disabled={isSubmitting}
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
