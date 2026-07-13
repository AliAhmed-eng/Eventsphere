import { useNavigate } from 'react-router-dom'

function Hero() {

  const navigate = useNavigate()

  return (
    <div className='min-h-screen md:h-screen bg-linear-to-r from-purple-800 via-indigo-700 to-cyan-600 text-white flex flex-col justify-center items-center text-center px-4 sm:px-6 py-16 md:py-0'>

      <h1 className='text-5xl sm:text-6xl md:text-8xl font-extrabold mb-6 drop-shadow-lg break-words'>
        EventSphere
      </h1>

      <p className='text-base sm:text-xl md:text-2xl max-w-2xl mb-10 leading-relaxed'>
        Manage concerts, conferences, gaming festivals and bookings with a modern database-driven platform.
      </p>

      <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto'>

        <button
          onClick={() => navigate('/events')}
          className='w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl text-lg sm:text-xl font-bold hover:scale-105 transition duration-300 shadow-xl'
        >
          Explore Events
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className='w-full sm:w-auto border-2 border-white px-8 py-4 rounded-xl text-lg sm:text-xl font-bold hover:bg-white hover:text-black transition duration-300'
        >
          Dashboard
        </button>

      </div>

    </div>
  )
}

export default Hero

