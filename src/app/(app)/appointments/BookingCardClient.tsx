'use client'

import { useState } from 'react'
import { updateBookingStatus } from '@/app/actions/bookings'
import { CheckCircle2, XCircle, Phone } from 'lucide-react'

export default function BookingCardClient({ booking, isPast }: { booking: any, isPast: boolean }) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateBookingStatus(booking.id, newStatus)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className={`glass-card p-4 rounded-[1.5rem] flex flex-col gap-4 touch-scale ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {booking.time_slot}
            </span>
            {isPast && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                booking.status === 'completed' ? 'text-teal-600 bg-teal-50 border-teal-100' :
                booking.status === 'no_show' ? 'text-red-600 bg-red-50 border-red-100' :
                'text-slate-600 bg-slate-50 border-slate-100'
              }`}>
                {booking.status.toUpperCase().replace('_', ' ')}
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-lg">{(booking.customers as any)?.name}</h4>
          <p className="text-sm font-medium text-slate-500">{booking.service_name_snapshot} • {booking.stylist_name_snapshot}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="font-bold text-teal-600">₹{booking.price}</p>
          {(booking.customers as any)?.phone && !(booking.customers as any)?.phone.startsWith('Unknown-') && (
            <a href={`tel:${(booking.customers as any)?.phone}`} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
      
      {booking.follow_up_note && (
        <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
          <p className="text-sm font-medium text-slate-700">
            <span className="font-bold text-orange-600 mr-2">Note:</span>
            {booking.follow_up_note}
          </p>
        </div>
      )}

      {!isPast && (
        <div className="flex gap-2 pt-3 border-t border-white/60">
          <button 
            onClick={() => handleStatusChange('completed')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl font-bold text-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </button>
          <button 
            onClick={() => handleStatusChange('no_show')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors"
          >
            <XCircle className="w-4 h-4" />
            No-Show
          </button>
        </div>
      )}
    </div>
  )
}
