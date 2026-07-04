import { useEffect, useState } from 'react'

import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import EventFilter from '../components/EventFilter'
import CategoryFilter from '../components/CategoryFilter'
import Footer from '../components/Footer'

import { supabase } from '../services/supabase'
import { categoriesService } from '../services/categories'
import { reviewsService } from '../services/reviews'

function getEventCategoryNames(event) {
  const names = (event.event_categories || [])
    .map(ec => ec.categories?.category_name)
    .filter(Boolean)
  console.log(`EVENT #${event.event_id} "${event.title}" CATEGORIES:`, names)
  return names
}

function Events() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [eventRatings, setEventRatings] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    priceRange: { min: 0, max: 10000 },
    minSeats: 0
  })
  const [selectedCategories, setSelectedCategories] = useState([])

  useEffect(() => {
    fetchEvents()
    fetchCategories()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [events, filters, selectedCategories])

  async function fetchCategories() {
    const data = await categoriesService.getAllCategories()
    setCategories(data)
  }

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_categories (
          category_id,
          categories (*)
        )
      `)

    if (!error && data) {
      setEvents(data)

      const ratings = {};
      await Promise.all(data.map(async (event) => {
        const ratingResult = await reviewsService.getEventRating(event.event_id);
        ratings[event.event_id] = {
          averageRating: ratingResult.averageRating || 0,
          totalReviews: ratingResult.totalReviews || 0
        };
      }));

      setEventRatings(ratings);
    }
  }

  const applyFilters = () => {
    let filtered = events

    if (filters.search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.venue.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    filtered = filtered.filter(event =>
      event.price >= filters.priceRange.min && event.price <= filters.priceRange.max
    )

    filtered = filtered.filter(event =>
      event.available_seats >= filters.minSeats
    )

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => {
        const names = getEventCategoryNames(event)
        return selectedCategories.some(selected => names.includes(selected))
      })
    }

    setFilteredEvents(filtered)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleCategoryChange = (newCategories) => {
    setSelectedCategories(newCategories)
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white">
      <Navbar />

      <div className="px-10 py-10">
        <h1 className="text-5xl font-bold mb-10">
          Upcoming Events
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <EventFilter onFilterChange={handleFilterChange} />
            <CategoryFilter 
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-4">
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event.event_id} 
                    event={event}
                    rating={eventRatings[event.event_id]?.averageRating || 0}
                    totalReviews={eventRatings[event.event_id]?.totalReviews || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl text-gray-400">
                  No events found matching your filters
                </p>
                <button
                  onClick={() => {
                    handleFilterChange({
                      search: '',
                      priceRange: { min: 0, max: 10000 },
                      minSeats: 0
                    })
                    handleCategoryChange([])
                  }}
                  className="mt-4 px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Events