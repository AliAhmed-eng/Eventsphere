import { supabase } from './supabase'
import { formatSupabaseError } from './supabaseErrors'

export const reviewsService = {
  async getEventReviews(eventId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          review_id,
          user_id,
          event_id,
          rating,
          comment,
          users (
            user_id,
            name,
            email
          )
        `)
        .eq('event_id', eventId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return []
    }
  },

  async getEventRating(eventId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('event_id', eventId)

      if (error) throw error

      if (!data || data.length === 0) {
        return { averageRating: 0, totalReviews: 0 }
      }

      const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
      const averageRating = (sum / data.length).toFixed(1)

      return { averageRating: parseFloat(averageRating), totalReviews: data.length }
    } catch (error) {
      console.error('Error calculating rating:', error)
      return { averageRating: 0, totalReviews: 0 }
    }
  },

  async addReview(userId, eventId, rating, comment) {
    try {
      const cleanRating = parseInt(rating)
      if (!userId || !eventId || cleanRating < 1 || cleanRating > 5) {
        return { success: false, error: 'Please select a rating from 1 to 5.' }
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: userId,
            event_id: eventId,
            rating: cleanRating,
            comment: (comment || '').slice(0, 500)
          }
        ])
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error adding review:', error)
      return { success: false, error: formatSupabaseError(error, 'Could not submit your review.') }
    }
  },

  async updateReview(reviewId, rating, comment) {
    try {
      const cleanRating = parseInt(rating)
      if (!reviewId || cleanRating < 1 || cleanRating > 5) {
        return { success: false, error: 'Please select a rating from 1 to 5.' }
      }

      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: cleanRating,
          comment: (comment || '').slice(0, 500)
        })
        .eq('review_id', reviewId)
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating review:', error)
      return { success: false, error: formatSupabaseError(error, 'Could not update your review.') }
    }
  },

  async deleteReview(reviewId) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('review_id', reviewId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting review:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserReview(userId, eventId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user review:', error)
      return null
    }
  }
}
