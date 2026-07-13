import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ReviewSection from '../components/ReviewSection'
import ReviewForm from '../components/ReviewForm'
import RatingStars from '../components/RatingStars'
import { supabase } from '../services/supabase'
import { reviewsService } from '../services/reviews'
import { categoriesService } from '../services/categories'
import { getEventImage } from '../utils/eventImage'
import { organizersService } from '../services/organizers'
import { createBooking } from '../services/bookings'
import { getNumericUserId } from '../utils/userId'
import { formatCurrency } from '../utils/currency'

function getUserId() {
  return getNumericUserId()
}

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [relatedEvents, setRelatedEvents] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState(null)
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [userReview, setUserReview] = useState(null)
  const [categories, setCategories] = useState([])
  const [organizers, setOrganizers] = useState([])

  useEffect(() => {
    const uid = getUserId()
    setUserId(uid)
    if (uid) localStorage.setItem('user_id', uid)

    fetchEventDetail()
  }, [id])

  async function fetchEventDetail() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', parseInt(id))
        .single()

      if (!error && data) {
        setEvent(data)
        fetchRelatedEvents(data.venue)
        fetchCategories(data.event_id)
        fetchOrganizers(data.event_id)
        fetchReviews(data.event_id)

        const uid = getUserId()
        if (uid) {
          checkUserReview(uid, data.event_id)
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRelatedEvents(venue) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('venue', venue)
        .neq('event_id', parseInt(id))
        .limit(3)

      if (!error) {
        setRelatedEvents(data || [])
      }
    } catch (error) {
      console.error('Error fetching related events:', error)
    }
  }

  async function fetchCategories(eventId) {
    const data = await categoriesService.getEventCategories(eventId)
    setCategories(data || [])
  }

  async function fetchOrganizers(eventId) {
    const data = await organizersService.getEventOrganizers(eventId)
    setOrganizers(data || [])
  }

  async function fetchReviews(eventId) {
    const data = await reviewsService.getEventReviews(eventId)
    setReviews(data || [])

    const ratingData = await reviewsService.getEventRating(eventId)
    setAverageRating(ratingData?.averageRating || 0)
    setTotalReviews(ratingData?.totalReviews || 0)
  }

  async function checkUserReview(uid, eventId) {
    const review = await reviewsService.getUserReview(uid, eventId)
    setUserReview(review)
  }

  const handleBooking = async () => {
    setBookingLoading(true)
    setMessage('')

    try {
      const uid = getUserId()

      if (!uid) {
        setMessage('✗ Please login first')
        setBookingLoading(false)
        return
      }

      if (!event?.available_seats || event.available_seats < 1) {
        setMessage('Sold out')
        setBookingLoading(false)
        return
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > event.available_seats) {
        setMessage(`Choose between 1 and ${event.available_seats} tickets`)
        setBookingLoading(false)
        return
      }

      const { booking, error } = await createBooking({
        user_id: uid,
        event_id: parseInt(id),
        quantity: quantity,
        price: event.price
      })

      if (error) {
        console.error("Booking failed:", error)
        setMessage(`✗ ${error}`)
        setBookingLoading(false)
        return
      }

      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const updatedCart = cart.filter(
        item => item.event_id !== parseInt(id)
      )
      localStorage.setItem('cart', JSON.stringify(updatedCart))

      if (!booking?.booking_id) {
        setMessage('✗ Booking created but no ID returned. Check My Bookings.')
        return
      }

      setMessage(`✓ ${quantity} booking(s) successful!`)

      window.dispatchEvent(new Event('cartUpdated'))

      setTimeout(() => {
        navigate(`/booking-confirmation/${booking.booking_id}`, { replace: true })
      }, 1200)

    } catch (error) {
      console.error(error)
      setMessage('Booking failed. Try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleOpenBookingModal = () => {
    setShowBookingModal(true)
  }

  const handleAddToWishlistLocal = () => {
    const uid = getUserId() || '1'
    const wishlistKey = `wishlist_${uid}`
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
    const exists = wishlist.some(i => i.event_id === event.event_id)
    if (!exists) {
      wishlist.push({ wishlist_id: Date.now(), event_id: event.event_id, events: event })
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist))
      window.dispatchEvent(new Event('wishlistUpdated'))
      setMessage('✓ Added to wishlist')
      setTimeout(() => setMessage(''), 2000)
    } else {
      setMessage('Already in wishlist')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleAddToCartLocal = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const exists = cart.some(c => c.event_id === event.event_id)
    if (!exists) {
      cart.push({ ...event, event_id: event.event_id, quantity: quantity })
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))
      setMessage('✓ Added to cart')
      setTimeout(() => setMessage(''), 2000)
    } else {
      setMessage('Already in cart')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const shareOnSocial = (platform) => {
    const text = `Check out this awesome event: ${event?.title} at ${event?.venue}`
    const links = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`
    }
    window.open(links[platform], '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <Navbar />
        <p className="text-xl">Loading...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="text-center p-10 px-4">
          <p className="text-2xl">Event not found</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 px-6 py-2 bg-purple-600 rounded-lg"
          >
            Back
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const totalPrice = event.price * quantity

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <Navbar />

      <div className="px-4 sm:px-6 md:px-10 py-8 md:py-10 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/events')}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
        >
          ← Back
        </button>

        {/* Event Banner Image */}
        {(() => {
          const img = getEventImage(event)
          return (
            <div
              className="relative h-40 sm:h-48 md:h-64 rounded-2xl overflow-hidden mb-6 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${img.gradient[0]}, ${img.gradient[1]}, ${img.gradient[2]})` }}
            >
              <div className="flex flex-col items-center gap-2 select-none">
                <div className="text-7xl md:text-8xl opacity-25">{img.emoji}</div>
                <div className="text-white/15 text-2xl md:text-3xl font-bold tracking-widest">{img.initials}</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-gray-950/20" />
            </div>
          )
        })()}

        {/* Event Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 break-words">{event.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span className="text-purple-400 font-semibold text-xl">{formatCurrency(event.price)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎫</span>
              <span className={event.available_seats > 0 ? 'text-green-400' : 'text-red-400'}>
                {event.available_seats > 0 ? `${event.available_seats} seats available` : 'Sold Out'}
              </span>
            </div>
          </div>

          {/* Rating Summary Bar */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <RatingStars rating={averageRating} size="sm" />
            <span className="text-yellow-400 font-bold text-lg">{averageRating > 0 ? averageRating : '—'}</span>
            <span className="text-gray-400">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
          <button
            onClick={handleOpenBookingModal}
            disabled={bookingLoading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 active:scale-95"
          >
            {bookingLoading ? '⏳ Booking...' : `Book Now — ${formatCurrency(totalPrice)}`}
          </button>
          <button
            onClick={handleAddToCartLocal}
            className="w-full sm:w-auto px-6 py-3 border border-green-500/50 hover:bg-green-500/20 text-green-300 font-semibold rounded-xl transition-all duration-300"
          >
            Add to Cart
          </button>
          <button
            onClick={handleAddToWishlistLocal}
            className="w-full sm:w-auto px-6 py-3 border border-pink-500/50 hover:bg-pink-500/20 text-pink-300 font-semibold rounded-xl transition-all duration-300"
          >
            ♥ Wishlist
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center font-semibold ${
            message.includes('✓') ? 'bg-green-900/50 border border-green-700 text-green-200' : 'bg-red-900/50 border border-red-700 text-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Categories & Organizers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {categories.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <span key={cat.category_id} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-200 rounded-full text-sm">
                    {cat.category_name || cat.category_id}
                  </span>
                ))}
              </div>
            </div>
          )}
          {organizers.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Organizers</h3>
              <div className="space-y-2">
                {organizers.map((org) => (
                  <div key={org.organizer_id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                      {(org.organizer_name || 'O')[0].toUpperCase()}
                    </div>
                    <span className="text-gray-300">{org.organizer_name || 'Organizer'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ReviewSection
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={totalReviews}
          showForm={
            userId ? (
              <ReviewForm
                eventId={parseInt(id)}
                userId={userId}
                existingReview={userReview}
                onReviewSubmitted={() => {
                  fetchReviews(parseInt(id))
                  checkUserReview(userId, parseInt(id))
                }}
              />
            ) : (
              <p className="text-gray-400 text-center">Please login to review</p>
            )
          }
        />
      </div>

      {showBookingModal && (
        <BookingModal
          event={event}
          quantity={quantity}
          setQuantity={setQuantity}
          onClose={() => setShowBookingModal(false)}
          onBook={async () => {
            await handleBooking()
            setShowBookingModal(false)
          }}
          onAddToWishlist={() => handleAddToWishlistLocal()}
          onAddToCart={() => handleAddToCartLocal()}
          loading={bookingLoading}
        />
      )}
      <Footer />
    </div>
  )
}

function BookingModal({ event, quantity, setQuantity, onClose, onBook, onAddToWishlist, onAddToCart, loading }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl p-5 sm:p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">{event?.title}</h3>
            <p className="text-gray-400 text-sm mb-2">{event?.venue} • {event?.event_date}</p>
            <p className="text-purple-400 text-xl font-bold mb-3">{formatCurrency(event?.price)}</p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <label className="text-gray-400">Tickets</label>
              <input
                type="number"
                min="1"
                max={event?.available_seats || 1}
                value={quantity}
                onChange={(e) => {
                  const max = event?.available_seats || 1
                  const next = Math.max(1, Math.min(max, parseInt(e.target.value) || 1))
                  setQuantity(next)
                }}
                className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-center"
              />
            </div>

            <div className="text-lg font-bold text-white mb-4">
              Total: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{formatCurrency((event?.price || 0) * quantity)}</span>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <button onClick={onBook} disabled={loading} className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300">
                {loading ? '⏳ Booking...' : 'Book Now'}
              </button>
              <button onClick={onAddToWishlist} className="w-full sm:w-auto px-5 py-2.5 border border-pink-500/50 hover:bg-pink-500/20 text-pink-300 rounded-xl transition">
                ♥ Wishlist
              </button>
              <button onClick={onAddToCart} className="w-full sm:w-auto px-5 py-2.5 border border-green-500/50 hover:bg-green-500/20 text-green-300 rounded-xl transition">
                Add to Cart
              </button>
              <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
