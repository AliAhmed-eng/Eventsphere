import { supabase } from './supabase'
import { formatSupabaseError } from './supabaseErrors'

export const categoriesService = {
  // Get all categories
  async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  },

  // Get categories for a specific event
  async getEventCategories(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select(`
          category_id,
          categories (
            category_id,
            category_name
          )
        `)
        .eq('event_id', eventId)

      if (error) throw error
      
      return data?.map(item => item.categories) || []
    } catch (error) {
      console.error('Error fetching event categories:', error)
      return []
    }
  },

  // Get events by category
  async getEventsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select(`
          event_id,
          events (
            event_id,
            title,
            venue,
            event_date,
            price,
            available_seats,
            description
          )
        `)
        .eq('category_id', categoryId)

      if (error) throw error
      
      return data?.map(item => item.events) || []
    } catch (error) {
      console.error('Error fetching events by category:', error)
      return []
    }
  },

  // Add category to event
  async addCategoryToEvent(eventId, categoryId) {
    try {
      const { error } = await supabase
        .from('event_categories')
        .insert([
          {
            event_id: eventId,
            category_id: categoryId
          }
        ])

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error adding category to event:', error)
      return { success: false, error: formatSupabaseError(error, 'Could not add that category to this event.') }
    }
  },

  // Remove category from event
  async removeCategoryFromEvent(eventId, categoryId) {
    try {
      const { error } = await supabase
        .from('event_categories')
        .delete()
        .eq('event_id', eventId)
        .eq('category_id', categoryId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error removing category from event:', error)
      return { success: false, error: error.message }
    }
  }
}
