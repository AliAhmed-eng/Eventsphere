import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllEvents } from "../services/events";
import { createBooking } from "../services/bookings";
import { useAuth } from "../hooks/useAuth";
import { getEventImage } from "../utils/eventImage";
import { getNumericUserId } from "../utils/userId";
import { formatCurrency } from "../utils/currency";

function getUserId(user) {
  return getNumericUserId(user);
}

function getUserInfo() {
  const cu = JSON.parse(localStorage.getItem("current_user") || "{}");
  if (cu?.name) return { name: cu.name, email: cu.email };
  const esu = JSON.parse(localStorage.getItem("eventSphereUser") || "{}");
  if (esu?.user_metadata?.full_name) return { name: esu.user_metadata.full_name, email: esu.email };
  if (esu?.email) return { name: esu.email.split("@")[0], email: esu.email };
  return { name: "Guest", email: "" };
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ numTickets: 1 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "Guest", email: "" });

  useEffect(() => {
    setUserInfo(getUserInfo());
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getAllEvents();
    setEvents(data || []);
    setLoading(false);
  };

  const handleBook = (event) => {
    setSelectedEvent(event);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    const uid = getUserId(user);
    if (!uid) {
      setToast({ message: "Please log in to book events", type: "error" });
      return;
    }
    if (!selectedEvent?.available_seats || selectedEvent.available_seats < 1) {
      setToast({ message: "This event is sold out", type: "error" });
      return;
    }
    if (!Number.isInteger(bookingData.numTickets) || bookingData.numTickets < 1 || bookingData.numTickets > selectedEvent.available_seats) {
      setToast({ message: `Choose between 1 and ${selectedEvent.available_seats} tickets`, type: "error" });
      return;
    }

    setBookingLoading(true);
    setToast({ message: "Processing booking...", type: "info" });

    const { booking, error } = await createBooking({
      user_id: uid,
      event_id: selectedEvent.event_id,
      quantity: bookingData.numTickets,
      price: selectedEvent.price
    });

    setBookingLoading(false);

    if (error) {
      console.error("Booking failed:", error);
      setToast({ message: `Booking failed: ${error}`, type: "error" });
      return;
    }

    if (!booking?.booking_id) {
      setToast({ message: "Booking created but no ID returned. Check My Bookings.", type: "error" });
      return;
    }

    setToast({ message: "Booking successful! Redirecting...", type: "success" });
    setShowBookingModal(false);
    setBookingData({ numTickets: 1 });
    await fetchEvents();
    setTimeout(() => navigate("/my-bookings", { state: { fresh: Date.now() } }), 1500);
  };

  const featuredEvents = events.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-600 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/50" />

        {/* Hero Content */}
        <div className="relative z-10 px-4 w-full max-w-4xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl shadow-purple-500/5">
            {userInfo.name !== "Guest" && (
              <p className="text-purple-400 font-semibold text-lg mb-2">Welcome back,</p>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 break-words">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
                {userInfo.name !== "Guest" ? userInfo.name : "EventSphere"}
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light mb-3">
              Discover. Book. Experience.
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg mb-8">
              Your gateway to unforgettable events — from tech conferences and live concerts to 
              creative workshops and community meetups. Find what moves you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
              >
                Browse Events
              </Link>
              {userInfo.name === "Guest" ? (
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3 border border-white/20 hover:border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95"
                >
                  Sign In
                </Link>
              ) : (
                <Link
                  to="/my-bookings"
                  className="w-full sm:w-auto px-8 py-3 border border-white/20 hover:border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95"
                >
                  My Bookings
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative px-4 md:px-10 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Why EventSphere?
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Everything you need to find and book amazing events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: "Discover Events",
              desc: "Explore a curated selection of concerts, tech events, workshops, and community gatherings near you."
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              ),
              title: "Book Experiences",
              desc: "Secure your spot instantly with our seamless booking system. No queues, no hassle."
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: "Connect & Share",
              desc: "Join a vibrant community of event-goers. Share reviews, build wishlists, and never miss out."
            }
          ].map((feat, i) => (
            <div
              key={i}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-500 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="relative px-4 md:px-10 py-16 max-w-6xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: events.length, label: "Events Hosted" },
              { value: "100+", label: "Happy Attendees" },
              { value: "5+", label: "Categories" },
              { value: "99%", label: "Satisfaction" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {stat.value}
                </p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED EVENTS ============ */}
      <section className="relative px-4 md:px-10 py-16 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Featured Events
              </span>
            </h2>
            <p className="text-gray-400 mt-1">Top picks for you</p>
          </div>
          <Link
            to="/events"
            className="hidden md:inline-flex px-5 py-2.5 border border-white/20 hover:border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5"
          >
            View All
          </Link>
        </div>

        {featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event, i) => {
              const seatsLeft = event.available_seats;
              const seatColor = seatsLeft === 0
                ? "bg-red-500/20 text-red-300"
                : seatsLeft <= 5
                ? "bg-amber-500/20 text-amber-300"
                : "bg-emerald-500/20 text-emerald-300";

              return (
                <div
                  key={event.event_id}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Event Image */}
                  {(() => {
                    const img = getEventImage(event)
                    return (
                      <div
                        className="h-28 flex items-center justify-center transition-transform duration-700 group-hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${img.gradient[0]}, ${img.gradient[1]}, ${img.gradient[2]})` }}
                      >
                        <div className="flex flex-col items-center gap-0.5 select-none">
                          <div className="text-4xl opacity-30">{img.emoji}</div>
                          <div className="text-white/20 text-sm font-bold tracking-widest">{img.initials}</div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="p-6 space-y-4">
                    {/* Price & Seats */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        {formatCurrency(event.price)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${seatColor}`}>
                        {seatsLeft === 0 ? "Sold Out" : `${seatsLeft} left`}
                      </span>
                    </div>

                    {/* Title */}
                    <Link to={`/events/${event.event_id}`}>
                      <h3 className="text-xl font-bold text-white leading-tight transition-colors duration-300 group-hover:text-purple-400">
                        {event.title}
                      </h3>
                    </Link>

                    {/* Venue & Date */}
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(event.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleBook(event)}
                        disabled={seatsLeft === 0}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
                      >
                        {seatsLeft === 0 ? "Sold Out" : "Book Now"}
                      </button>
                      <Link
                        to={`/events/${event.event_id}`}
                        className="flex-1 px-4 py-2.5 border border-white/20 hover:border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 text-center active:scale-95"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500 mb-2">No events yet</p>
            <p className="text-gray-600">Events will appear here once they're added</p>
          </div>
        )}

        {/* Mobile "View All" link */}
        <div className="text-center mt-8 md:hidden">
          <Link
            to="/events"
            className="inline-flex px-6 py-3 border border-white/20 hover:border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-300"
          >
            View All Events
          </Link>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="relative px-4 md:px-10 py-20 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-white/10 rounded-3xl p-8 md:p-14 text-center backdrop-blur-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for your next experience?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of event-goers. Book tickets, save favorites, and connect with your community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
            >
              Get Started
            </Link>
            <Link
              to="/signup"
              className="px-8 py-3 border border-white/20 hover:border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 active:scale-95"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ============ BOOKING MODAL ============ */}
      {showBookingModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl shadow-purple-500/10">
            <h2 className="text-2xl font-bold text-white mb-4">Confirm Booking</h2>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm">Event</p>
                <p className="text-white font-semibold">{selectedEvent.title}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm">Price per ticket</p>
                <p className="text-white font-semibold">{formatCurrency(selectedEvent.price)}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-gray-400 text-sm mb-2">Number of Tickets</p>
                <input
                  type="number"
                  min="1"
                  max={selectedEvent.available_seats}
                  value={bookingData.numTickets}
                  onChange={(e) =>
                    setBookingData({ numTickets: Math.max(1, Math.min(parseInt(e.target.value) || 1, selectedEvent.available_seats)) })
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-4 rounded-lg border border-purple-500/50">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {formatCurrency(selectedEvent.price * bookingData.numTickets)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingData({ numTickets: 1 });
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {bookingLoading ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl font-semibold shadow-xl backdrop-blur-xl border transition-all duration-500 ${
        toast.type === "success"
        ? "bg-green-900/80 border-green-700 text-green-200"
        : toast.type === "info"
        ? "bg-blue-900/80 border-blue-700 text-blue-200"
        : "bg-red-900/80 border-red-700 text-red-200"
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100">&times;</button>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Dashboard;
