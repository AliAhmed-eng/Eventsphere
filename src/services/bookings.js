import { supabase } from "./supabase";
import { decreaseAvailableSeats, increaseAvailableSeats } from "./events";
import { ticketsService } from "./tickets";
import { paymentsService } from "./payments";
import { formatSupabaseError } from "./supabaseErrors";

/**
 * Create new booking
 * Schema: booking_id, user_id, event_id, quantity, booking_date
 */
export async function createBooking(bookingData) {
  try {
    const quantity = parseInt(bookingData.quantity) || 1;
    const userId = parseInt(bookingData.user_id);
    const eventId = parseInt(bookingData.event_id);

    if (!userId || isNaN(userId)) {
      return { booking: null, error: "Invalid user ID. Please log in again." };
    }
    if (!eventId || isNaN(eventId)) {
      return { booking: null, error: "Invalid event ID." };
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { booking: null, error: "Please choose at least one ticket." };
    }

    // 1. Create booking (insert both quantity and num_tickets for data consistency)
    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert([{ user_id: userId, event_id: eventId, quantity, num_tickets: quantity }])
      .select()
      .single();

    if (bookingError) {
      console.error("Booking insert error:", bookingError);
      return { booking: null, error: formatSupabaseError(bookingError, "Booking failed. Please try again.") };
    }

    const bookingId = newBooking.booking_id;

    // 2. Decrease available seats
    const decreaseResult = await decreaseAvailableSeats(eventId, quantity);
    if (!decreaseResult.success) {
      await supabase.from("bookings").delete().eq("booking_id", bookingId);
      return { booking: null, error: "Failed to update event seats" };
    }

    // 3. Generate tickets (non-critical — log but don't fail)
    const { error: ticketError } = await ticketsService.createTickets(
      bookingId, eventId, quantity
    );
    if (ticketError) {
      console.error("Ticket creation error (non-fatal):", ticketError);
    }

    // 4. Create payment record (non-critical — log but don't fail)
    const totalAmount = (parseFloat(bookingData.price) || 0) * quantity;
    const { error: paymentError } = await paymentsService.createPayment(bookingId, totalAmount);
    if (paymentError) {
      console.error("Payment creation error (non-fatal):", paymentError);
    }

    return { booking: newBooking, error: null };
  } catch (err) {
    console.error("Create booking error:", err);
    return { booking: null, error: err.message || "Booking failed. Please try again." };
  }
}

/**
 * Get user bookings
 */
export async function getUserBookings(userId) {
  try {
    const uid = parseInt(userId) || userId;
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          event_id,
          title,
          venue,
          event_date,
          price
        )
      `)
      .eq("user_id", uid)
      .order("booking_date", { ascending: false });

    if (error) {
      console.error("Get bookings error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Get user bookings error:", err.message);
    return [];
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          *,
          event_organizers (
            organizers (*)
          )
        ),
        users (user_id, name, email, phone),
        tickets (*)
      `)
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (error) {
      console.error("Get booking error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Get booking by ID error:", err.message);
    return null;
  }
}

/**
 * Cancel booking - deletes the booking and restores seats
 */
export async function cancelBooking(bookingId, eventId, quantity) {
  try {
    const bid = parseInt(bookingId) || bookingId;
    const eid = parseInt(eventId) || eventId;
    // 1. Delete the booking
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("booking_id", bid);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // 2. Increase available seats
    const increaseResult = await increaseAvailableSeats(eid, quantity);

    if (!increaseResult.success) {
      return { success: false, error: "Failed to update seats" };
    }

    return { success: true };
  } catch (err) {
    console.error("Cancel booking error:", err.message);
    return { success: false, error: "Failed to cancel booking" };
  }
}

/**
 * Get event bookings (for organizer)
 */
export async function getEventBookings(eventId) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users (user_id, name, email, phone)
      `)
      .eq("event_id", eventId)
      .order("booking_date", { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Get event bookings error:", err.message);
    return [];
  }
}

/**
 * Check if user has booked an event
 */
export async function hasUserBookedEvent(userId, eventId) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("booking_id")
      .eq("user_id", parseInt(userId) || userId)
      .eq("event_id", parseInt(eventId) || eventId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (err) {
    return false;
  }
}
