import { supabase } from './supabase'
import { formatSupabaseError } from './supabaseErrors'

export const organizersService = {
  // Get organizers for a specific event
  async getEventOrganizers(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_organizers')
        .select(`
          organizer_id,
          organizers (
            organizer_id,
            organizer_name,
            email,
            phone
          )
        `)
        .eq('event_id', eventId)

      if (error) throw error
      
      return data?.map(item => item.organizers) || []
    } catch (error) {
      console.error('Error fetching event organizers:', error)
      return []
    }
  },

  // Get all organizers
  async getAllOrganizers() {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('organizer_name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching organizers:', error)
      return []
    }
  },

  // Create a new organizer
  async createOrganizer(organizerData) {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .insert([organizerData])
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating organizer:', error)
      return { success: false, error: formatSupabaseError(error, 'Could not create that organizer.') }
    }
  },

  // Add organizer to event
  async addOrganizerToEvent(eventId, organizerId) {
    try {
      const { error } = await supabase
        .from('event_organizers')
        .insert([
          {
            event_id: eventId,
            organizer_id: organizerId
          }
        ])

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error adding organizer to event:', error)
      return { success: false, error: formatSupabaseError(error, 'Could not add that organizer to this event.') }
    }
  },

  // Remove organizer from event
  async removeOrganizerFromEvent(eventId, organizerId) {
    try {
      const { error } = await supabase
        .from('event_organizers')
        .delete()
        .eq('event_id', eventId)
        .eq('organizer_id', organizerId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error removing organizer from event:', error)
      return { success: false, error: error.message }
    }
  }
}
