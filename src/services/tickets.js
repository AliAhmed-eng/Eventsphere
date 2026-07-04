import { supabase } from "./supabase";
import { formatSupabaseError } from "./supabaseErrors";

export const ticketsService = {
  async createTickets(bookingId, eventId, quantity) {
    try {
      // Get the highest seat number already assigned for this event
      const { data: existing } = await supabase
        .from("tickets")
        .select("seat_number")
        .eq("event_id", eventId)
        .order("seat_number", { ascending: false })
        .limit(1);

      const startSeat = (existing?.[0]?.seat_number || 0) + 1;

      const tickets = []
      for (let i = 0; i < quantity; i++) {
        tickets.push({
          booking_id: bookingId,
          event_id: eventId,
          seat_number: startSeat + i,
          qr_code: `EVT-${eventId}-SEAT-${startSeat + i}`
        })
      }

      const { data, error } = await supabase
        .from("tickets")
        .insert(tickets)
        .select()

      if (error) throw error
      return { tickets: data || [], error: null }
    } catch (err) {
      console.error("Create tickets error:", err.message)
      return { tickets: [], error: formatSupabaseError(err, "Could not create tickets.") }
    }
  },

  async getTicketsByBooking(bookingId) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("booking_id", bookingId)

      if (error) throw error
      return data || []
    } catch (err) {
      console.error("Get tickets error:", err.message)
      return []
    }
  }
}
