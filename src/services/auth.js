import { supabase } from "./supabase";
import { formatSupabaseError } from "./supabaseErrors";

/**
 * LOGIN USER (FIXED)
 */
export async function loginUser(email, password) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle(); // ✅ FIXED (no crash)

    if (error || !data) {
      return { user: null, error: "User not found" };
    }

    if (data.password !== cleanPassword) {
      return { user: null, error: "Wrong password" };
    }

    localStorage.setItem("current_user", JSON.stringify(data));

    return { user: data, error: null };
  } catch (err) {
    console.error("Login error:", err.message);
    return { user: null, error: "Login failed" };
  }
}

/**
 * REGISTER USER (FIXED)
 */
export async function registerUser(name, email, phone, password) {
  try {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanPassword) {
      return { user: null, error: "Please fill in all fields." };
    }

    if (cleanPassword.length < 6) {
      return { user: null, error: "Password must be at least 6 characters." };
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return { user: null, error: "Email already registered" };
    }

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password: cleanPassword,
        },
      ])
      .select()
      .single();

    if (error) {
      return { user: null, error: formatSupabaseError(error, "Registration failed.") };
    }

    localStorage.setItem("current_user", JSON.stringify(data));

    return { user: data, error: null };
  } catch (err) {
    console.error("Register error:", err.message);
    return { user: null, error: "Registration failed" };
  }
}

/**
 * GET USER
 */
export async function getUserById(userId) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data || null;
}

/**
 * UPDATE USER
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from("users")
    .update({
      name: updates.name?.trim(),
      email: updates.email?.trim().toLowerCase(),
      phone: updates.phone?.trim(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return { user: null, error: formatSupabaseError(error, "Could not update your profile.") };

  localStorage.setItem("current_user", JSON.stringify(data));

  return { user: data, error: null };
}

/**
 * CURRENT USER
 */
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("current_user"));
}

/**
 * LOGOUT
 */
export function logoutUser() {
  localStorage.removeItem("current_user");
}

/**
 * GUEST USER (FIXED)
 */
export async function getOrCreateUser() {
  // Check all auth storage keys
  const existing = getCurrentUser();
  if (existing?.user_id) return existing.user_id;

  const esu = JSON.parse(localStorage.getItem("eventSphereUser") || "{}");
  if (esu?.id) return esu.id;

  const u = JSON.parse(localStorage.getItem("user") || "{}");
  if (u?.id) return u.id;

  const uid = localStorage.getItem("user_id");
  if (uid) return uid;

  const guestEmail = `guest_${Date.now()}@guest.com`;

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: "Guest User",
        email: guestEmail,
        phone: "0000000000",
        password: "guest123",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  localStorage.setItem("current_user", JSON.stringify(data));

  return data.user_id;
}
