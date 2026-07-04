import { useNavigate } from 'react-router-dom'

function Hero() {

  const navigate = useNavigate()

  return (
    <div className='h-screen bg-linear-to-r from-purple-800 via-indigo-700 to-cyan-600 text-white flex flex-col justify-center items-center text-center px-6'>

      <h1 className='text-8xl font-extrabold mb-6 drop-shadow-lg'>
        EventSphere
      </h1>

      <p className='text-2xl max-w-2xl mb-10 leading-relaxed'>
        Manage concerts, conferences, gaming festivals and bookings with a modern database-driven platform.
      </p>

      <div className='flex gap-6'>

        <button
          onClick={() => navigate('/events')}
          className='bg-white text-black px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition duration-300 shadow-xl'
        >
          Explore Events
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className='border-2 border-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-white hover:text-black transition duration-300'
        >
          Dashboard
        </button>

      </div>

    </div>
  )
}

export default Hero

