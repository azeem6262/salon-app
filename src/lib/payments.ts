export interface PaymentRecord {
  date: string
  amount: number
  note?: string
}

export interface ParsedPaymentData {
  totalPrice: number
  paidAmount: number
  balance: number
  status: 'paid' | 'partial' | 'unpaid'
  history: PaymentRecord[]
  cleanNote: string
}

const PAYMENT_TAG_REGEX = /<!--pay:(\{[\s\S]*?\})-->/

/**
 * Parses payment details from a booking row, checking dedicated columns first
 * and falling back to embedded metadata in follow_up_note.
 */
export function parseBookingPayment(booking: any): ParsedPaymentData {
  const totalPrice = Number(booking.price) || 0
  let paidAmount: number | null = null
  let history: PaymentRecord[] = []
  let cleanNote = booking.follow_up_note || ''

  // 1. Check if DB has paid_amount column populated
  if (booking.paid_amount !== undefined && booking.paid_amount !== null) {
    paidAmount = Number(booking.paid_amount)
    if (Array.isArray(booking.payment_history)) {
      history = booking.payment_history
    }
  }

  // 2. Fall back to embedded tag in follow_up_note
  if (cleanNote) {
    const match = cleanNote.match(PAYMENT_TAG_REGEX)
    if (match) {
      try {
        const metadata = JSON.parse(match[1])
        if (paidAmount === null && metadata.paid !== undefined) {
          paidAmount = Number(metadata.paid)
        }
        if (history.length === 0 && Array.isArray(metadata.history)) {
          history = metadata.history
        }
      } catch (e) {
        console.error('Error parsing payment metadata', e)
      }
      // Remove metadata tag from the user-facing note
      cleanNote = cleanNote.replace(PAYMENT_TAG_REGEX, '').trim()
    }
  }

  // 3. Fallback: if no payment info was explicitly recorded,
  // assume completed bookings were fully paid, and confirmed/no_show bookings are unpaid
  if (paidAmount === null) {
    paidAmount = booking.status === 'completed' ? totalPrice : 0
  }

  const balance = Math.max(0, totalPrice - paidAmount)
  let status: 'paid' | 'partial' | 'unpaid' = 'unpaid'
  if (paidAmount >= totalPrice && totalPrice > 0) {
    status = 'paid'
  } else if (paidAmount > 0) {
    status = 'partial'
  }

  return {
    totalPrice,
    paidAmount,
    balance,
    status,
    history,
    cleanNote
  }
}

/**
 * Embeds payment metadata into note string for zero-migration fallback compatibility.
 */
export function encodePaymentIntoNote(note: string | null | undefined, paidAmount: number, history: PaymentRecord[]): string {
  const baseNote = (note || '').replace(PAYMENT_TAG_REGEX, '').trim()
  const metaObj = {
    paid: paidAmount,
    history
  }
  const tag = `<!--pay:${JSON.stringify(metaObj)}-->`
  return baseNote ? `${baseNote}\n${tag}` : tag
}
