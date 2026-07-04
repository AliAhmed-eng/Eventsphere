import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../services/supabase'
import { formatSupabaseError } from '../services/supabaseErrors'

function Profile() {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', parseInt(userId))
        .single()

      if (!error && data) {
        setUser(data)
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setMessage('')

    try {
      const userId = localStorage.getItem('user_id')
      const cleanName = formData.name.trim()
      const cleanEmail = formData.email.trim().toLowerCase()
      const cleanPhone = formData.phone.trim()

      if (!cleanName || !cleanEmail || !cleanPhone) {
        setMessage('Please fill in all profile fields')
        setLoading(false)
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setMessage('Please enter a valid email address')
        setLoading(false)
        return
      }

      if (cleanPhone.length < 7) {
        setMessage('Please enter a valid phone number')
        setLoading(false)
        return
      }
      
      const { error } = await supabase
        .from('users')
        .update({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone
        })
        .eq('user_id', parseInt(userId))

      if (error) {
        setMessage(formatSupabaseError(error, 'Error updating profile'))
      } else {
        setMessage('Profile updated successfully! ✓')
        setIsEditing(false)
        loadUserProfile()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error saving profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('کیا آپ logout کرنا چاہتے ہیں؟\nAre you sure you want to logout?')) {
      localStorage.removeItem('user_id')
      setUser(null)
      setMessage('Logged out successfully! ✓')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
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

  if (!user) {
    return (
      <div className="bg-gray-950 min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-gray-900 p-12 rounded-2xl max-w-md">
            <p className="text-3xl font-bold mb-4">👤</p>
            <p className="text-2xl font-bold mb-4">Create Your Profile</p>
            <p className="text-gray-300 mb-8">Book your first event to create an account</p>
            <button
              onClick={() => window.location.href = '/events'}
              className="w-full px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 font-semibold text-lg"
            >
              Browse Events & Book
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="px-10 py-10 max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold mb-10">My Profile</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${message.includes('✓') ? 'bg-green-900' : 'bg-red-900'}`}>
            {message}
          </div>
        )}

        <div className="bg-gray-900 p-8 rounded-2xl">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm">Name</label>
                <p className="text-2xl font-semibold">{user.name || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm">Email</label>
                <p className="text-2xl font-semibold">{user.email || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm">Phone</label>
                <p className="text-2xl font-semibold">{user.phone || 'Not set'}</p>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-purple-600 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1 bg-green-600 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-700 py-3 rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Profile
