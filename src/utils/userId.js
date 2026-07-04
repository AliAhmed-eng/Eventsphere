export function getNumericUserId(user) {
  const cu = JSON.parse(localStorage.getItem("current_user") || "null");
  if (cu?.user_id) return parseInt(cu.user_id);

  if (user?.user_id) return parseInt(user.user_id);

  const raw = localStorage.getItem("user_id");
  if (raw) {
    const parsed = parseInt(raw);
    if (!isNaN(parsed)) return parsed;
  }

  const esu = JSON.parse(localStorage.getItem("eventSphereUser") || "null");
  if (esu?.user_id) return parseInt(esu.user_id);

  return null;
}
