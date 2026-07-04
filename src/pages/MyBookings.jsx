import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";
import { getUserBookings, cancelBooking } from "../services/bookings";
import { paymentsService } from "../services/payments";
import { useAuth } from "../hooks/useAuth";
import { getEventImage } from "../utils/eventImage";
import { getNumericUserId } from "../utils/userId";
import { formatCurrency } from "../utils/currency";
import { supabase } from "../services/supabase";

function getUserId(user) {
  return getNumericUserId(user);
}

async function attachPayments(bookings) {
  const ids = bookings.map(b => b.booking_id);
  if (!ids.length) return bookings;
  const { data: pays } = await supabase
    .from("payments")
    .select("*")
    .in("booking_id", ids);
  const map = {};
  for (const p of pays || []) {
    (map[p.booking_id] || (map[p.booking_id] = [])).push(p);
  }
  return bookings.map(b => ({ ...b, payments: map[b.booking_id] || [] }));
}

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchBookings();
    const onFocus = () => fetchBookings();
    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", () => {
      if (!document.hidden) fetchBookings();
    });
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  const fetchBookings = async () => {
    const uid = getUserId(user);
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getUserBookings(uid);
    const withPayments = await attachPayments(data);
    setBookings(withPayments);
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId, eventId, quantity) => {
    const { success, error } = await cancelBooking(bookingId, eventId, quantity);
    if (error) {
      setToast({ message: error, type: "error" });
      return;
    }
    setToast({ message: "Booking cancelled successfully", type: "success" });
    fetchBookings();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">View and manage your event bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-2xl font-bold text-white mb-2">No bookings yet</p>
            <p className="text-gray-400 mb-8">Start exploring events and book your tickets!</p>
            <Link
              to="/events"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-semibold transition"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
              {bookings.map((booking) => {
              const numTickets = booking.quantity || 1;
              const event = booking.events;
              const totalPrice = event?.price ? event.price * numTickets : 0;
              const payment = booking.payments?.[0] || null;

              const paymentBadge = () => {
                if (!payment) return null;
                const s = payment.payment_status;
                if (s === 'paid') return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-semibold text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Paid</span>;
                if (s === 'failed') return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full text-xs font-semibold text-red-300"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Failed</span>;
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-semibold text-amber-300"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Pending</span>;
              };

              const handlePay = async () => {
                await paymentsService.updatePaymentStatus(booking.booking_id, 'paid');
                fetchBookings();
              };

              const handleFail = async () => {
                await paymentsService.updatePaymentStatus(booking.booking_id, 'failed');
                fetchBookings();
              };

              return (
                <div
                  key={booking.booking_id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/40 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="shrink-0">
                      {(() => {
                        const img = getEventImage(event || {})
                        return (
                          <div
                            className="w-full md:w-28 h-28 rounded-xl flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${img.gradient[0]}, ${img.gradient[1]}, ${img.gradient[2]})` }}
                          >
                            <div className="flex flex-col items-center gap-0.5 select-none">
                              <div className="text-3xl opacity-35">{img.emoji}</div>
                              <div className="text-white/20 text-xs font-bold">{img.initials}</div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {event?.title || "Unknown Event"}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <p className="truncate">{event?.venue}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <p>{formatDate(event?.event_date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🎫</span>
                          <p>{numTickets} ticket{numTickets > 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <p className="text-purple-400 font-semibold">{formatCurrency(totalPrice)}</p>
                        </div>
                      </div>

                      {payment && payment.payment_status !== 'paid' && (
                        <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <p className="text-amber-300 text-xs font-semibold">⚠️ Payment {payment.payment_status === 'failed' ? 'Failed' : 'Pending'}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-gray-500">Booking ID: #{booking.booking_id}</span>
                        {paymentBadge()}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      {payment && payment.payment_status === 'pending' && (
                        <>
                          <button
                            onClick={handlePay}
                            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-300 active:scale-95"
                          >
                            Pay Now (Simulated)
                          </button>
                          <button
                            onClick={handleFail}
                            className="px-6 py-2 border border-red-500/50 hover:bg-red-500/20 text-red-300 rounded-xl transition font-semibold"
                          >
                            Mark as Failed
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id, booking.event_id, numTickets)}
                        className="px-6 py-2 border border-red-500/50 hover:bg-red-500/20 text-red-300 rounded-xl transition font-semibold"
                      >
                        Cancel Booking
                      </button>
                      <Link
                        to={`/events/${event?.event_id}`}
                        className="px-6 py-2 border border-purple-500/50 hover:bg-purple-500/20 text-purple-300 rounded-xl transition font-semibold text-center"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default MyBookings;
