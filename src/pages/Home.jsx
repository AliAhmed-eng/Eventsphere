import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import { supabase } from '../services/supabase'

function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut()
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Welcome Banner */}
      {user && (
        <div className="bg-gradient-to-r from-cyan-900 to-purple-900 text-white py-6 px-4 sm:px-6 md:px-10 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
                👋 Welcome back, {user.user_metadata?.full_name || user.email}!
              </h2>
              <p className="text-gray-200 break-words">
                📧 {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      <Hero />
      <Footer />
    </div>
  )
}

export default Home