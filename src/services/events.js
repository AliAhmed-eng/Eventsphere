import { supabase } from "./supabase";
import { formatSupabaseError } from "./supabaseErrors";

/**
 * Get all events with organizer info
 */
export async function getAllEvents(categoryId = null) {
  try {
    let eventIds = null;
    if (categoryId) {
      const { data: ecData } = await supabase
        .from("event_categories")
        .select("event_id")
        .eq("category_id", categoryId);
      eventIds = (ecData || []).map(e => e.event_id);
    }

    let query = supabase
      .from("events")
      .select(`
        *,
        event_organizers (
          organizer_id,
          organizers (*)
        ),
        event_categories (
          category_id,
          categories (*)
        ),
        reviews (*)
      `);

    if (eventIds && eventIds.length > 0) {
      query = query.in("event_id", eventIds);
    } else if (categoryId) {
      return [];
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get events error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Get all events error:", err.message);
    return [];
  }
}

/**
 * Get single event with all details
 */
export async function getEventById(eventId) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_organizers (
          organizer_id,
          organizers (*)
        ),
        event_categories (
          category_id,
          categories (*)
        ),
        reviews (
          *,
          users (user_id, name, email)
        ),
        tickets (*)
      `)
      .eq("event_id", eventId)
      .single();

    if (error) {
      console.error("Get event error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Get event by ID error:", err.message);
    return null;
  }
}

/**
 * Create new event (admin only)
 */
export async function createEvent(eventData) {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select()
      .single();

    if (error) {
      return { event: null, error: formatSupabaseError(error, "Could not create that event.") };
    }

    return { event: data, error: null };
  } catch (err) {
    console.error("Create event error:", err.message);
    return { event: null, error: "Failed to create event" };
  }
}

/**
 * Update event
 */
export async function updateEvent(eventId, updates) {
  try {
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("event_id", eventId)
      .select()
      .single();

    if (error) {
      return { event: null, error: formatSupabaseError(error, "Could not update that event.") };
    }

    return { event: data, error: null };
  } catch (err) {
    console.error("Update event error:", err.message);
    return { event: null, error: "Failed to update event" };
  }
}

/**
 * Search events by title or venue
 */
export async function searchEvents(query) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_organizers (
          organizer_id,
          organizers (*)
        ),
        event_categories (
          category_id,
          categories (*)
        )
      `)
      .or(
        `title.ilike.%${query}%,venue.ilike.%${query}%`
      );

    if (error) {
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Search events error:", err.message);
    return [];
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_organizers (
          organizer_id,
          organizers (*)
        ),
        event_categories (
          category_id,
          categories (*)
        ),
        reviews (*)
      `)
      .gt("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(20);

    if (error) {
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Get upcoming events error:", err.message);
    return [];
  }
}

/**
 * Decrease available seats when booking
 */
export async function decreaseAvailableSeats(eventId, count = 1) {
  try {
    // Get current available seats
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("available_seats")
      .eq("event_id", eventId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const newSeats = Math.max(0, event.available_seats - count);

    // Update available seats
    const { error: updateError } = await supabase
      .from("events")
      .update({ available_seats: newSeats })
      .eq("event_id", eventId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, availableSeats: newSeats };
  } catch (err) {
    console.error("Decrease seats error:", err.message);
    return { success: false, error: "Failed to update seats" };
  }
}

/**
 * Increase available seats when cancelling booking
 */
export async function increaseAvailableSeats(eventId, count = 1) {
  try {
    // Get current available seats
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("available_seats")
      .eq("event_id", eventId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const newSeats = (event.available_seats || 0) + count;

    // Update available seats
    const { error: updateError } = await supabase
      .from("events")
      .update({ available_seats: newSeats })
      .eq("event_id", eventId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, availableSeats: newSeats };
  } catch (err) {
    console.error("Increase seats error:", err.message);
    return { success: false, error: "Failed to update seats" };
  }
}
