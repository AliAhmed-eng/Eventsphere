import { supabase } from './supabase'
import { formatSupabaseError } from './supabaseErrors'

export const wishlistService = {
  // Get user's wishlist
  async getUserWishlist(userId) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          wishlist_id,
          user_id,
          event_id,
          added_at,
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
        .eq('user_id', userId)
        .order('added_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      return []
    }
  },

  // Check if event is in wishlist
  async isEventInWishlist(userId, eventId) {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('wishlist_id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .single()

      if (error?.code === 'PGRST116') return false
      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error checking wishlist:', error)
      return false
    }
  },

  // Add event to wishlist
  async addToWishlist(userId, eventId) {
    try {
      // Check if already in wishlist
      const exists = await this.isEventInWishlist(userId, eventId)
      if (exists) {
        return { success: false, error: 'Already in wishlist' }
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert([
          {
            user_id: userId,
            event_id: eventId
          }
        ])
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return { success: false, error: formatSupabaseError(error, 'Could not add this event to your wishlist.') }
    }
  },

  // Remove event from wishlist
  async removeFromWishlist(userId, eventId) {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return { success: false, error: error.message }
    }
  },

  // Clear entire wishlist
  async clearWishlist(userId) {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      return { success: false, error: error.message }
    }
  }
}
