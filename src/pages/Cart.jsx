import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getOrCreateUser } from '../services/auth'
import { createBooking } from '../services/bookings'
import { getEventImage } from '../utils/eventImage'
import { formatCurrency } from '../utils/currency'

function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', loadCart)
    window.addEventListener('storage', loadCart)
    
    return () => {
      window.removeEventListener('cartUpdated', loadCart)
      window.removeEventListener('storage', loadCart)
    }
  }, [])

  const loadCart = () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setCartItems(JSON.parse(saved))
    } else {
      setCartItems([])
    }
  }

  const handleRemoveFromCart = (eventId) => {
    const updated = cartItems.filter(item => item.event_id !== eventId)
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleUpdateQuantity = (eventId, newQuantity) => {
    if (newQuantity < 1) return
    
    const updated = cartItems.map(item =>
      item.event_id === eventId ? { ...item, quantity: Math.min(newQuantity, item.available_seats || newQuantity) } : item
    )
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleClearCart = () => {
    if (window.confirm('Clear entire cart?')) {
      setCartItems([])
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    setMessage('')

    try {
      const userId = await getOrCreateUser()
      if (!userId) {
        setMessage('Please log in or create an account before checkout.')
        setLoading(false)
        return
      }
      let lastBooking = null

      // Process each cart item
      for (const item of cartItems) {
        if (!item.quantity || item.quantity < 1 || item.quantity > item.available_seats) {
          setMessage(`Choose between 1 and ${item.available_seats} tickets for ${item.title}`)
          setLoading(false)
          return
        }

        const { booking, error } = await createBooking({
          user_id: userId,
          event_id: item.event_id,
          quantity: item.quantity,
          price: item.price
        })

        if (error) {
          setMessage(`✗ Error booking ${item.title}: ${error}`)
          setLoading(false)
          return
        }

        lastBooking = booking
      }

      if (!lastBooking?.booking_id) {
        setMessage('✗ Bookings created but no ID returned. Check My Bookings.')
        setLoading(false)
        return
      }

      setMessage(`✓ All bookings confirmed!`)

      setCartItems([])
      localStorage.removeItem('cart')

      window.dispatchEvent(new Event('cartUpdated'))

      setTimeout(() => {
        navigate(`/booking-confirmation/${lastBooking.booking_id}`, { replace: true })
      }, 1500)
    } catch (error) {
      setMessage('Checkout failed. Try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="bg-gray-950 min-h-screen text-white overflow-x-hidden">
      <Navbar />

      <div className="px-4 md:px-10 py-8 md:py-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 break-words">🛒 Shopping Cart</h1>
          <p className="text-gray-400 text-base sm:text-lg">Review your items before checkout</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg text-center font-semibold ${message.includes('✓') ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
            {message}
          </div>
        )}

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.event_id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-purple-500 transition">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Image */}
                      <div className="shrink-0">
                        {(() => {
                          const img = getEventImage(item)
                          return (
                            <div
                              className="w-full sm:w-28 h-28 rounded-xl flex items-center justify-center"
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

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold mb-1 break-words">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">📍 {item.venue}</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-gray-500 text-sm">Unit Price</p>
                            <p className="text-lg font-semibold text-purple-400">{formatCurrency(item.price)}</p>
                          </div>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg w-full sm:w-auto justify-between sm:justify-start">
                            <button
                              onClick={() => handleUpdateQuantity(item.event_id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded transition"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.event_id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded transition"
                            >
                              +
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-left sm:text-right">
                            <p className="text-gray-500 text-sm">Subtotal</p>
                            <p className="text-xl font-bold text-purple-400">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromCart(item.event_id)}
                        className="shrink-0 text-2xl text-gray-500 hover:text-red-400 transition"
                        title="Remove from cart"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <button
                onClick={handleClearCart}
                className="mt-6 w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition font-semibold"
              >
                Clear All Items
              </button>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-linear-to-br from-purple-900 to-purple-800 border border-purple-700 rounded-2xl p-6 sm:p-8 sticky top-24">
                <h2 className="text-xl sm:text-2xl font-bold mb-8 text-center">Order Summary</h2>

                {/* Items Count */}
                <div className="space-y-4 mb-6 pb-6 border-b border-purple-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">Items</span>
                    <span className="text-xl font-bold">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">Events</span>
                    <span className="text-xl font-bold">{cartItems.length}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-300">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-300">Tax (0%)</span>
                    <span className="font-semibold">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-300">Delivery</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 flex justify-between">
                    <span className="text-gray-200 font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-white text-purple-600 py-4 rounded-lg hover:bg-gray-100 transition font-bold text-base sm:text-lg disabled:opacity-50 mb-3"
                >
                  {loading ? '⏳ Processing...' : '✓ Confirm Checkout'}
                </button>

                {/* Trust Badge */}
                <div className="text-center text-sm text-gray-300 flex items-center justify-center gap-2">
                  <span>🔒</span>
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart
          <div className="text-center py-24 px-4">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-2xl sm:text-3xl font-bold mb-2">Your cart is empty</p>
            <p className="text-gray-400 text-base sm:text-lg mb-8">Add some events to get started</p>
            <button
              onClick={() => navigate('/events')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-base sm:text-lg transition inline-block"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Cart

