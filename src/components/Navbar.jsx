import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logoutUser } from '../services/auth'
import { Menu, X } from 'lucide-react'

function Navbar() {
  const { logout: authLogout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [userId, setUserId] = useState(null)
  const [userInfo, setUserInfo] = useState({ name: 'Guest', email: '' })

  const loadUserInfo = () => {
    const cu = JSON.parse(localStorage.getItem('current_user') || '{}')
    if (cu?.name) return { name: cu.name, email: cu.email }
    const esu = JSON.parse(localStorage.getItem('eventSphereUser') || '{}')
    if (esu?.user_metadata?.full_name) return { name: esu.user_metadata.full_name, email: esu.email }
    if (esu?.email) return { name: esu.email.split('@')[0], email: esu.email }
    return { name: 'Guest', email: '' }
  }

  useEffect(() => {
    setUserInfo(loadUserInfo())
    const id = localStorage.getItem('user_id')
    setUserId(id)
    updateCounts(id)

    const onStorage = () => {
      const newId = localStorage.getItem('user_id')
      setUserId(newId)
      updateCounts(newId)
      setUserInfo(loadUserInfo())
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('cartUpdated', () => updateCounts(id))
    window.addEventListener('wishlistUpdated', () => updateCounts(id))

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cartUpdated', () => updateCounts(id))
      window.removeEventListener('wishlistUpdated', () => updateCounts(id))
    }
  }, [])

  const updateCounts = (id) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.length)
    if (id) {
      const wishlistKey = `wishlist_${id}`
      const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
      setWishlistCount(wishlist.length)
    }
  }

  const handleLogout = () => {
    authLogout()
    logoutUser()
    setMobileMenuOpen(false)
    navigate('/login')
  }

  const isLoggedIn = !!localStorage.getItem('current_user')
  const avatarLetter = (userInfo.name || 'G')[0].toUpperCase()

  return (
    <nav className='bg-black text-white px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50 relative'>
      <Link to='/' className='text-2xl md:text-5xl font-extrabold text-cyan-400 hover:text-cyan-300 transition shrink-0'>
        EventSphere
      </Link>

      <div className='hidden md:flex items-center gap-6'>
        <div className='space-x-6 text-lg font-medium flex items-center'>
          <Link className='hover:text-cyan-400 transition' to='/'>Home</Link>
          <Link className='hover:text-cyan-400 transition' to='/events'>Events</Link>
          <Link className='hover:text-cyan-400 transition' to='/wishlist'>
            Wishlist{wishlistCount > 0 && <span className='ml-1 text-xs text-pink-400'>({wishlistCount})</span>}
          </Link>
          <Link className='hover:text-cyan-400 transition' to='/cart'>
            Cart{cartCount > 0 && <span className='ml-1 text-xs text-green-400'>({cartCount})</span>}
          </Link>
          <Link className='hover:text-cyan-400 transition' to='/my-bookings'>My Bookings</Link>
        </div>

        {isLoggedIn && (
          <div className='flex items-center gap-3 pl-6 border-l border-white/20'>
            <div className='w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0'>
              {avatarLetter}
            </div>
            <div className='hidden md:block min-w-0 max-w-40'>
              <p className='text-sm font-semibold text-white truncate'>{userInfo.name}</p>
              <p className='text-xs text-gray-400 truncate'>{userInfo.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className='px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-lg transition'
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <button
        type='button'
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        className='md:hidden w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0'
        aria-label='Toggle navigation menu'
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileMenuOpen && (
        <div className='absolute left-0 right-0 top-full md:hidden bg-black border-t border-white/10 shadow-xl z-50'>
          <div className='px-4 py-4 space-y-3'>
            <Link className='block rounded-xl bg-white/5 px-4 py-3' to='/' onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link className='block rounded-xl bg-white/5 px-4 py-3' to='/events' onClick={() => setMobileMenuOpen(false)}>Events</Link>
            <Link className='block rounded-xl bg-white/5 px-4 py-3' to='/wishlist' onClick={() => setMobileMenuOpen(false)}>
              Wishlist{wishlistCount > 0 && <span className='ml-1 text-xs text-pink-400'>({wishlistCount})</span>}
            </Link>
            <Link className='block rounded-xl bg-white/5 px-4 py-3' to='/cart' onClick={() => setMobileMenuOpen(false)}>
              Cart{cartCount > 0 && <span className='ml-1 text-xs text-green-400'>({cartCount})</span>}
            </Link>
            <Link className='block rounded-xl bg-white/5 px-4 py-3' to='/my-bookings' onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>

            {isLoggedIn && (
              <div className='rounded-xl border border-white/10 bg-white/5 p-4 space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shrink-0'>
                    {avatarLetter}
                  </div>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-white truncate'>{userInfo.name}</p>
                    <p className='text-xs text-gray-400 truncate'>{userInfo.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className='w-full px-3 py-2.5 bg-red-600 hover:bg-red-700 text-sm font-semibold text-white rounded-lg transition'
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar