'use client'

import { useState } from 'react'
import { recordPayment } from '@/app/actions/bookings'
import { ParsedPaymentData } from '@/lib/payments'
import { X, CheckCircle2, History, CreditCard } from 'lucide-react'

interface RecordPaymentModalProps {
  booking: any
  paymentData: ParsedPaymentData
  isOpen: boolean
  onClose: () => void
}

export default function RecordPaymentModal({
  booking,
  paymentData,
  isOpen,
  onClose
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<number>(paymentData.balance > 0 ? paymentData.balance : 0)
  const [note, setNote] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const newPaidTotal = paymentData.paidAmount + (amount || 0)
  const newBalance = Math.max(0, paymentData.totalPrice - newPaidTotal)
  const isOverpaying = newPaidTotal > paymentData.totalPrice

  const handleQuickSelect = (val: number) => {
    setAmount(Math.max(0, Math.min(paymentData.balance, val)))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount.')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await recordPayment(booking.id, amount, note || 'Installment payment')
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to record payment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Record Payment</h3>
              <p className="text-xs font-semibold text-slate-500">
                {(booking.customers as any)?.name} • {booking.service_name_snapshot}
              </p>
            </div>
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
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Payment Status Summary Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Total Treatment Cost:</span>
              <span className="font-bold text-slate-900">₹{paymentData.totalPrice}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Already Paid:</span>
              <span className="font-bold text-teal-600">₹{paymentData.paidAmount}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-800">Current Balance Due:</span>
              <span className="font-extrabold text-amber-600 text-base">₹{paymentData.balance}</span>
            </div>
          </div>

          {/* Amount to pay input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paying Now (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount || ''}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 500"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-inner"
            />

            {/* Quick chips */}
            {paymentData.balance > 0 && (
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleQuickSelect(paymentData.balance)}
                  className="px-3 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg text-xs font-bold transition-colors"
                >
                  Pay Full Balance (₹{paymentData.balance})
                </button>
                {paymentData.balance > 500 && (
                  <button
                    type="button"
                    onClick={() => handleQuickSelect(Math.round(paymentData.balance / 2))}
                    className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    Pay Half (₹{Math.round(paymentData.balance / 2)})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* New Balance Preview */}
          <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
            newBalance === 0 
              ? 'bg-teal-50 text-teal-700 border-teal-200' 
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            <span>Remaining After Payment:</span>
            <span className="font-bold text-sm">
              {newBalance === 0 ? '✓ Paid in Full!' : `₹${newBalance} Due`}
            </span>
          </div>

          {/* Payment Note */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Visit 2 payment, UPI / Cash, etc."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Installment History Log */}
          {paymentData.history.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <History className="w-3.5 h-3.5" />
                <span>Payment Installment History</span>
              </div>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                {paymentData.history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                    <div>
                      <span className="font-bold text-slate-800">₹{h.amount}</span>
                      {h.note && <span className="text-slate-500 ml-1.5">• {h.note}</span>}
                    </div>
                    <span className="text-slate-400 font-medium">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
              disabled={isSaving || !amount || amount <= 0}
              className="flex-1 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all touch-scale disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
