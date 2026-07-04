# ⚙️ Google OAuth Setup Guide

## Issue: Google Login Not Working

Follow these steps to fix Google OAuth authentication:

---

## **Step 1: Configure Supabase Google OAuth**

1. Go to **Supabase Dashboard**: https://supabase.com
2. Select your project: **EventSphere** (kmqrkqtrwtgdbwrvczcm)
3. Left sidebar → **Authentication** → **Providers**
4. Find **Google** and enable it
5. You'll need:
   - **Google Client ID**
   - **Google Client Secret**

---

## **Step 2: Get Google OAuth Credentials**

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Add Authorized redirect URIs:
   ```
   http://localhost:5173/auth/v1/callback
   http://localhost:5173/dashboard
   https://kmqrkqtrwtgdbwrvczcm.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**

---

## **Step 3: Add to Supabase**

1. Back in Supabase → Authentication → Providers → Google
2. Paste:
   - **Client ID** (from Google Cloud)
   - **Client Secret** (from Google Cloud)
3. Click **Save**

---

## **Step 4: Configure Redirect URL in Supabase**

1. Supabase Dashboard → **Project Settings** → **General**
2. Find **App URL** section, update if needed
3. Go to **Auth** → **URL Configuration**
4. Add Redirect URLs:
   ```
   http://localhost:5173/dashboard
   http://localhost:5173/
   ```

---

## **Step 5: Verify .env.local**

Make sure `.env.local` exists in project root with:

```env
VITE_SUPABASE_URL=https://kmqrkqtrwtgdbwrvczcm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_kdJUb2p_femFi8r1dJJHJg_-F1RZcd5
```

---

## **Step 6: Test Login**

1. **Restart dev server** (`npm run dev`)
2. Open browser console (Press **F12**)
3. Click **"Continue with Google"**
4. Check console for any errors
5. Should redirect to dashboard after login

---

## **Common Issues:**

| Problem | Solution |
|---------|----------|
| **"redirect_uri_mismatch"** | Add exact URI to Google Cloud Console |
| **Blank OAuth popup** | Check Google credentials are saved in Supabase |
| **"Invalid client_id"** | Verify Google Client ID is correct in Supabase |
| **No redirect after login** | Check redirect URLs in Supabase Auth config |

---

## **Need Help?**

Check browser console (F12) for detailed error messages - they'll tell you exactly what's wrong!
