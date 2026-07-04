# 🔍 Supabase Google OAuth Diagnostic

## **Check These in Supabase Dashboard:**

### **Step 1: Go to Authentication → Providers**
- [ ] Google is **ENABLED** (toggle is ON)?
- [ ] **Client ID** is filled in?
- [ ] **Client Secret** is filled in?

### **Step 2: Go to Project Settings → General**
- [ ] What is your **Project URL**?
- [ ] Copy it exactly

### **Step 3: Go to Authentication → URL Configuration**
- [ ] **Site URL** = `http://localhost:5185`
- [ ] **Redirect URLs** includes:
  - `http://localhost:5185/login`
  - `http://localhost:5185/auth/v1/callback`

### **Step 4: Google Cloud Console**
- [ ] **Client ID** matches Supabase?
- [ ] **Client Secret** matches Supabase?
- [ ] **Authorized JavaScript origins** = `http://localhost:5185`
- [ ] **Authorized Redirect URIs** include:
  - `http://localhost:5185/login`
  - `http://localhost:5185/auth/v1/callback`
  - `https://kmqrkqtrwtgdbwrvczcm.supabase.co/auth/v1/callback`

---

## **Test Steps:**

1. Open browser console (F12)
2. Click "Continue with Google"
3. **Watch the console** - what error do you see?
4. Tell me the **exact error message**

---

## **Common Errors:**

| Error | Fix |
|-------|-----|
| `redirect_uri_mismatch` | Add exact URI to Google Console |
| `invalid_client` | Check Client ID/Secret in Supabase |
| `access_denied` | User refused Google permission |
| Blank page after login | Check redirect URL configuration |

