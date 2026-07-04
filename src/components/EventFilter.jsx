import { useState } from 'react'
import { formatCurrency } from '../utils/currency'

function EventFilter({ onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [minSeats, setMinSeats] = useState(0)

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onFilterChange({
      search: value,
      priceRange,
      minSeats
    })
  }
  

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value) }
    setPriceRange(newRange)
    onFilterChange({
      search: searchTerm,
      priceRange: newRange,
      minSeats
    })
  }

  const handleSeatsChange = (e) => {
    const value = parseInt(e.target.value)
    setMinSeats(value)
    onFilterChange({
      search: searchTerm,
      priceRange,
      minSeats: value
    })
  }

  const resetFilters = () => {
    setSearchTerm('')
    setPriceRange({ min: 0, max: 10000 })
    setMinSeats(0)
    onFilterChange({
      search: '',
      priceRange: { min: 0, max: 10000 },
      minSeats: 0
    })
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Filter Events</h2>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-lg font-semibold text-white mb-2">
            Search Event
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by title or venue..."
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-600"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-lg font-semibold text-white mb-2">
            Price Range: {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Available Seats */}
        <div>
          <label className="block text-lg font-semibold text-white mb-2">
            Minimum Available Seats: {minSeats}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={minSeats}
            onChange={handleSeatsChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}

export default EventFilter
