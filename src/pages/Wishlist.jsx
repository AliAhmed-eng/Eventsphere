import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RatingStars from '../components/RatingStars'
import { reviewsService } from '../services/reviews'
import { getEventImage } from '../utils/eventImage'
import { formatCurrency } from '../utils/currency'

function getUserId() {
  const cu = JSON.parse(localStorage.getItem('current_user') || '{}')
  if (cu?.user_id) return cu.user_id
  const esu = JSON.parse(localStorage.getItem('eventSphereUser') || '{}')
  if (esu?.id) return esu.id
  const uid = localStorage.getItem('user_id')
  if (uid) return uid
  const fu = JSON.parse(localStorage.getItem('user') || '{}')
  if (fu?.id) return fu.id
  return null
}

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const [message, setMessage] = useState('')
  const [eventRatings, setEventRatings] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const id = getUserId()
    if (id) localStorage.setItem('user_id', id)
    setUserId(id)
    loadWishlist(id)

    const handler = () => loadWishlist(id)
    window.addEventListener('wishlistUpdated', handler)
    return () => window.removeEventListener('wishlistUpdated', handler)
  }, [])

  async function loadWishlist(uid) {
    try {
      if (!uid) {
        setWishlistItems([])
        return
      }
      const wishlistKey = `wishlist_${uid}`
      const wishlistData = JSON.parse(localStorage.getItem(wishlistKey) || '[]')

      if (wishlistData && wishlistData.length > 0) {
        setWishlistItems(wishlistData)

        for (const item of wishlistData) {
          const { averageRating, totalReviews } = await reviewsService.getEventRating(item.event_id)
          setEventRatings(prev => ({
            ...prev,
            [item.event_id]: { averageRating, totalReviews }
          }))
        }
      } else {
        setWishlistItems([])
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (eventId) => {
    try {
      const wishlistKey = `wishlist_${userId}`
      let wishlistData = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
      wishlistData = wishlistData.filter(item => item.event_id !== eventId)
      localStorage.setItem(wishlistKey, JSON.stringify(wishlistData))

      setMessage('✓ Removed from wishlist')
      loadWishlist(userId)
      window.dispatchEvent(new Event('wishlistUpdated'))
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const handleAddToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const exists = cart.some(c => c.event_id === item.event_id)
    if (!exists) {
      cart.push({ ...item, quantity: 1 })
      localStorage.setItem('cart', JSON.stringify(cart))
      setMessage('✓ Added to cart')
      window.dispatchEvent(new Event('cartUpdated'))
      setTimeout(() => setMessage(''), 2000)
    } else {
      setMessage('Already in cart')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleClearWishlist = async () => {
    if (!window.confirm('Clear entire wishlist?')) return
    try {
      const wishlistKey = `wishlist_${userId}`
      localStorage.setItem(wishlistKey, JSON.stringify([]))
      setWishlistItems([])
      setMessage('✓ Wishlist cleared')
      window.dispatchEvent(new Event('wishlistUpdated'))
      setTimeout(() => setMessage(''), 2000)
    } catch (error) {
      console.error('Error clearing wishlist:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-2xl">Loading...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white overflow-x-hidden">
      <Navbar />

      <div className="px-4 md:px-10 py-8 md:py-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 break-words">❤️ My Wishlist</h1>
          <p className="text-gray-400 text-base sm:text-lg">Your saved favorite events</p>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-lg text-center font-semibold ${message.includes('✓') ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
            {message}
          </div>
        )}

        {wishlistItems.length > 0 ? (
          <>
            <div className="space-y-4 mb-8">
              {wishlistItems.map((item) => {
                const ev = item.events || item
                return (
                  <div
                    key={item.wishlist_id || item.event_id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-purple-500/40 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                      <div className="shrink-0">
                        {(() => {
                          const img = getEventImage(ev)
                          return (
                            <div
                              className="w-full md:w-32 h-32 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition"
                              style={{ background: `linear-gradient(135deg, ${img.gradient[0]}, ${img.gradient[1]}, ${img.gradient[2]})` }}
                              onClick={() => navigate(`/events/${item.event_id}`)}
                            >
                              <div className="flex flex-col items-center gap-0.5 select-none">
                                <div className="text-3xl opacity-35">{img.emoji}</div>
                                <div className="text-white/20 text-xs font-bold">{img.initials}</div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-xl sm:text-2xl font-bold mb-2 cursor-pointer hover:text-purple-400 transition break-words"
                          onClick={() => navigate(`/events/${item.event_id}`)}
                        >
                          {ev?.title}
                        </h3>

                        {eventRatings[item.event_id]?.totalReviews > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <RatingStars rating={eventRatings[item.event_id]?.averageRating || 0} size="sm" />
                            <span className="text-sm text-gray-400">
                              ({eventRatings[item.event_id]?.totalReviews})
                            </span>
                          </div>
                        )}

                        <p className="text-gray-400 text-sm mb-1">📍 {ev?.venue}</p>
                        <p className="text-gray-400 text-sm mb-3">📅 {formatDate(ev?.event_date)}</p>

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                          <div>
                            <p className="text-gray-500 text-sm">Price</p>
                            <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                              {formatCurrency(ev?.price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Available Seats</p>
                            <p className={`text-lg font-semibold ${ev?.available_seats > 10 ? 'text-green-400' : 'text-orange-400'}`}>
                              {ev?.available_seats}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 justify-start w-full md:w-auto">
                        <button
                          onClick={() => navigate(`/events/${item.event_id}`)}
                          className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition font-semibold whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full md:w-auto px-4 py-2 border border-green-500/50 hover:bg-green-500/20 text-green-300 rounded-xl transition font-semibold whitespace-nowrap"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.event_id)}
                          className="w-full md:w-auto px-4 py-2 border border-red-500/50 hover:bg-red-500/20 text-red-300 rounded-xl transition font-semibold whitespace-nowrap"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl">
                <p className="text-gray-400 mb-2">Total Items in Wishlist</p>
                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {wishlistItems.length}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl flex items-end">
                <button
                  onClick={handleClearWishlist}
                  className="w-full px-6 py-3 border border-red-500/50 hover:bg-red-500/20 text-red-300 rounded-xl transition font-semibold"
                >
                  Clear All Items
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24 px-4">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-2xl sm:text-3xl font-bold mb-2">Your wishlist is empty</p>
            <p className="text-gray-400 text-base sm:text-lg mb-8">Save your favorite events to view them later</p>
            <button
              onClick={() => navigate('/events')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-bold text-base sm:text-lg transition inline-block"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Wishlist
