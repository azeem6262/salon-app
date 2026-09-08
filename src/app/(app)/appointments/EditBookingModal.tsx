'use client'

import { useState } from 'react'
import { updateBooking } from '@/app/actions/bookings'
import { parseBookingPayment } from '@/lib/payments'
import { X, Check } from 'lucide-react'

interface EditBookingModalProps {
  booking: any
  services: any[]
  stylists: any[]
  isOpen: boolean
  onClose: () => void
}

export default function EditBookingModal({
  booking,
  services,
  stylists,
  isOpen,
  onClose
}: EditBookingModalProps) {
  const paymentInitial = parseBookingPayment(booking)

  const [selectedServices, setSelectedServices] = useState<any[]>(() => {
    if (booking.service_ids && booking.service_ids.length > 0) {
      return services.filter(s => booking.service_ids.includes(s.id))
    }
    if (booking.service_id) {
      const found = services.find(s => s.id === booking.service_id)
      return found ? [found] : []
    }
    return []
  })
  
  const [price, setPrice] = useState<number>(booking.price || 0)
  const [paidAmount, setPaidAmount] = useState<number>(paymentInitial.paidAmount)
  const [bookingDate, setBookingDate] = useState<string>(booking.booking_date || '')
  const [bookingTime, setBookingTime] = useState<string>(booking.time_slot === 'TBD' ? '' : booking.time_slot || '')
  const [stylistId, setStylistId] = useState<string>(booking.stylist_id || '')
  const [status, setStatus] = useState<string>(booking.status || 'confirmed')
  const [notes, setNotes] = useState<string>(paymentInitial.cleanNote)

  const [serviceSearch, setServiceSearch] = useState('')
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const balance = Math.max(0, price - paidAmount)

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  )

  const toggleService = (s: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(x => x.id === s.id)
      const next = isSelected ? prev.filter(x => x.id !== s.id) : [...prev, s]
      const newPrice = next.reduce((sum, curr) => sum + curr.default_price, 0)
      setPrice(newPrice)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const formData = new FormData()
      selectedServices.forEach(s => formData.append('serviceIds', s.id))
      formData.set('stylistId', stylistId)
      formData.set('bookingDate', bookingDate)
      formData.set('bookingTime', bookingTime)
      formData.set('price', price.toString())
      formData.set('paidAmount', paidAmount.toString())
      formData.set('status', status)
      formData.set('notes', notes)

      await updateBooking(booking.id, formData)
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to update appointment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/60">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Edit Appointment</h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Client: <span className="text-indigo-600 font-bold">{(booking.customers as any)?.name}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Status Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('confirmed')}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  status === 'confirmed'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Confirmed
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  status === 'completed'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() => setStatus('no_show')}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  status === 'no_show'
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                No-Show
              </button>
            </div>
          </div>

          {/* Services Multi-Select */}
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />

              {isServiceDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-52 overflow-y-auto z-30 flex flex-col">
                  {filteredServices.length > 0 ? (
                    filteredServices.map(s => {
                      const isSelected = selectedServices.some(x => x.id === s.id)
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleService(s)}
                          className={`px-4 py-3 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0 hover:bg-indigo-50 transition-colors ${isSelected ? 'bg-indigo-50/60' : ''}`}
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
                    })
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-500 text-center font-medium">No services found.</div>
                  )}

                  <div
                    className="sticky bottom-0 bg-slate-50/95 backdrop-blur-sm border-t border-slate-100 text-center py-3 text-sm font-bold text-indigo-600 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setIsServiceDropdownOpen(false)}
                  >
                    Done
                  </div>
                </div>
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedServices.map(s => (
                  <div key={s.id} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                    <span>{s.name}</span>
                    <button type="button" onClick={() => toggleService(s)} className="text-indigo-400 hover:text-indigo-700 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Provider */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Provider / Specialist</label>
            <select
              value={stylistId}
              onChange={e => setStylistId(e.target.value)}
              required
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">Select a provider...</option>
              {stylists.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time (Optional)</label>
              <input
                type="time"
                value={bookingTime}
                onChange={e => setBookingTime(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Pricing & Multi-Part Payments */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all font-bold text-teal-700"
              />
            </div>
          </div>

          {/* Balance Preview */}
          <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
            balance === 0 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span>Payment Status:</span>
            <span className="font-bold">
              {balance === 0 ? '✓ Paid in Full' : `Due: ₹${balance}`}
            </span>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Treatment details, instructions or requests..."
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all touch-scale disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
