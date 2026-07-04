import { supabase } from "./supabase";
import { formatSupabaseError } from "./supabaseErrors";

export const paymentsService = {
  async createPayment(bookingId, amount) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .insert([{ booking_id: bookingId, amount }])
        .select()

      if (error) throw error
      return { payment: data?.[0] || null, error: null }
    } catch (err) {
      console.error("Create payment error:", err.message)
      return { payment: null, error: formatSupabaseError(err, "Could not create payment.") }
    }
  },

  async getPaymentByBooking(bookingId) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle()

      if (error) throw error
      return data || null
    } catch (err) {
      console.error("Get payment error:", err.message)
      return null
    }
  },

  async updatePaymentStatus(bookingId, status) {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ payment_status: status })
        .eq("booking_id", bookingId)

      if (error) throw error
      return { success: true, error: null }
    } catch (err) {
      console.error("Update payment status error:", err.message)
      return { success: false, error: formatSupabaseError(err, "Could not update payment status.") }
    }
  }
}
