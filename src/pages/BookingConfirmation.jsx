import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LoadingSpinner from '../components/LoadingSpinner'
import { getBookingById } from '../services/bookings'
import { getEventImage } from '../utils/eventImage'
import { formatCurrency } from '../utils/currency'
import { paymentsService } from '../services/payments'

function BookingConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    fetchBookingDetails()
    return () => { mountedRef.current = false }
  }, [id])

  async function fetchPayment(bookingId) {
    try {
      const payment = await paymentsService.getPaymentByBooking(bookingId)
      if (mountedRef.current) {
        setBooking(prev => prev ? { ...prev, payments: payment ? [payment] : [] } : prev)
      }
    } catch (e) {
      console.error('Error fetching payment:', e)
    }
  }

  async function fetchBookingDetails(attempt = 1) {
    const maxAttempts = 3
    const delay = 600

    try {
      const data = await getBookingById(parseInt(id))
      if (!mountedRef.current) return

      if (data) {
        data.payments = []
        setBooking(data)
        setLoading(false)
        fetchPayment(data.booking_id)
        return
      }

      if (attempt < maxAttempts) {
        console.log(`Booking #${id} not found yet (attempt ${attempt}/${maxAttempts}), retrying...`)
        await new Promise(r => setTimeout(r, delay))
        if (mountedRef.current) {
          fetchBookingDetails(attempt + 1)
        }
      } else {
        console.error(`Booking #${id} not found after ${maxAttempts} attempts`)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="bg-gray-950 min-h-screen text-white">
        <Navbar />
        <div className="px-4 sm:px-10 py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 break-words">Booking Not Found</h1>
          <p className="text-gray-400 mb-8">The booking you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            Browse Events
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const numTickets = booking.quantity || 1
  const event = booking.events
  const totalPrice = event?.price ? event.price * numTickets : 0
  const tickets = booking.tickets || []
  const payment = booking.payments?.[0] || null
  const img = getEventImage(event || {})

  const paymentBadge = () => {
    if (!payment) return null
    const status = payment.payment_status
    if (status === 'paid') return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-sm font-semibold text-emerald-300"><span className="w-2 h-2 rounded-full bg-emerald-400" />Paid</span>
    if (status === 'failed') return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-sm font-semibold text-red-300"><span className="w-2 h-2 rounded-full bg-red-400" />Payment Failed</span>
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-sm font-semibold text-amber-300"><span className="w-2 h-2 rounded-full bg-amber-400" />Payment Pending</span>
  }

  const handleSimulatePayment = async () => {
    const result = await paymentsService.updatePaymentStatus(booking.booking_id, 'paid')
    if (result.success) {
      fetchBookingDetails()
    }
  }

  const handleSimulateFailure = async () => {
    const result = await paymentsService.updatePaymentStatus(booking.booking_id, 'failed')
    if (result.success) {
      fetchBookingDetails()
    }
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white overflow-x-hidden">
      <Navbar />

      <div className="px-4 md:px-10 py-8 md:py-10">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 break-words">Booking Confirmed!</h1>
          <p className="text-gray-400">Your tickets have been successfully booked</p>
        </div>

        {/* Booking Details */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main Card */}
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Booking ID</p>
                <p className="text-xl sm:text-2xl font-bold break-words">#{booking.booking_id}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-gray-400 text-sm mb-1">Booking Date</p>
                <p className="text-base sm:text-lg break-words">{formatDate(booking.booking_date)}</p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              {/* Event Banner */}
              <div
                className="h-24 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `linear-gradient(135deg, ${img.gradient[0]}, ${img.gradient[1]}, ${img.gradient[2]})` }}
              >
                <div className="flex flex-col items-center gap-0.5 select-none">
                  <div className="text-3xl opacity-30">{img.emoji}</div>
                  <div className="text-white/20 text-sm font-bold">{img.initials}</div>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold mb-4 break-words">{event?.title}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    <div>
                      <p className="text-gray-400 text-sm">Venue</p>
                      <p className="font-semibold">{event?.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="font-semibold">{event?.event_date}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🎫</span>
                    <div>
                      <p className="text-gray-400 text-sm">Tickets</p>
                      <p className="font-semibold">{numTickets} ticket{numTickets > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">💰</span>
                    <div>
                      <p className="text-gray-400 text-sm">Total Price</p>
                      <p className="font-semibold text-purple-400">{formatCurrency(totalPrice)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            {booking.users && (
              <div className="border-t border-gray-800 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3">Attendee Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="font-semibold">{booking.users.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="font-semibold">{booking.users.email}</p>
                  </div>
                  {booking.users.phone && (
                    <div>
                      <p className="text-gray-400 text-sm">Phone</p>
                      <p className="font-semibold">{booking.users.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tickets Card */}
          {tickets.length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold mb-4">🎟️ Your Tickets</h2>
              <div className="space-y-3">
                {tickets.map((ticket, i) => (
                  <div key={ticket.ticket_id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-400">Ticket #{i + 1}</p>
                      <p className="font-mono text-sm text-purple-400">{ticket.qr_code}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-sm font-semibold text-white">Seat {ticket.seat_number}</span>
                      <span className="text-xs text-gray-500">ID: {ticket.ticket_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Card */}
          {payment && (
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold">💳 Payment Details</h2>
                {paymentBadge()}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-gray-400 text-sm">Payment ID</p>
                  <p className="font-semibold">#{payment.payment_id}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              {payment.payment_status === 'pending' && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSimulatePayment}
                    className="flex-1 w-full px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-300 active:scale-95"
                  >
                    Pay Now (Simulated)
                  </button>
                  <button
                    onClick={handleSimulateFailure}
                    className="flex-1 w-full px-5 py-2.5 border border-red-500/50 hover:bg-red-500/20 text-red-300 font-semibold rounded-xl transition-all duration-300"
                  >
                    Mark as Failed (Test)
                  </button>
                </div>
              )}
            </div>
          )}

          {payment && payment.payment_status !== 'paid' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
              <p className="text-amber-300 font-semibold">⚠️ Pending Payment — complete payment to confirm your booking</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17V7a2 2 0 012-2h6a2 2 0 012 2v10m-8 0h8" />
              </svg>
              Print Ticket
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/events')}
              className="w-full sm:w-auto px-6 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
            >
              Browse More Events
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BookingConfirmation
