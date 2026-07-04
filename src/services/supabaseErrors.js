export function formatSupabaseError(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  if (error.code === "23505") {
    const details = `${error.message || ""} ${error.details || ""}`.toLowerCase();
    if (details.includes("users_email") || details.includes("email")) {
      return "That email is already registered.";
    }
    if (details.includes("wishlist")) {
      return "This event is already in your wishlist.";
    }
    if (details.includes("reviews")) {
      return "You have already reviewed this event.";
    }
    if (details.includes("payments")) {
      return "A payment record already exists for this booking.";
    }
    if (details.includes("tickets")) {
      return "A ticket with that seat or QR code already exists.";
    }
    return "This record already exists.";
  }

  if (error.code === "23503") {
    return "Related event or user information could not be found.";
  }

  if (error.code === "23502" || error.code === "23514") {
    return "Please check the form values and try again.";
  }

  return error.message || fallback;
}
