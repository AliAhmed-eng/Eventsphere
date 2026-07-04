# EventSphere - Professional Event Management System

A complete full-stack event management system built with React + Vite + Tailwind CSS, featuring real-time Supabase integration with custom email/password authentication.

## 🎯 Features Implemented

### ✅ Authentication System
- **Custom Email/Password Login** - No Google OAuth
- **User Registration** - Email, name, phone, password validation
- **Persistent Auth** - localStorage-based session management
- **Auth Context** - Global state management for authenticated users
- **Protected Routes** - Automatic redirection for unauthenticated users

### ✅ Dashboard & Navigation
- **Modern Sidebar** - Responsive navigation with hover effects
- **User Profile Display** - Shows current logged-in user info
- **Glassmorphism UI** - Modern backdrop blur and gradient effects
- **Mobile Responsive** - Fully responsive on mobile devices

### ✅ Events Management
- **Browse All Events** - Real-time data from Supabase
- **Event Cards** - Display title, venue, price, date, ratings
- **Category Filtering** - Filter events by type
- **Search Functionality** - Find events by keywords
- **Event Details** - View full event information

### ✅ Booking System
- **Book Events** - Select number of tickets, confirm booking
- **Automatic Seat Reduction** - Seats decrease when booking confirmed
- **My Bookings Page** - View all user bookings
- **Booking Management** - Cancel bookings and restore seats
- **Real-time Updates** - Seat counts update automatically

### ✅ Reviews & Ratings
- **Submit Reviews** - Leave ratings (1-5 stars) and comments
- **Event Ratings** - Display average rating per event
- **Review Count** - Show number of reviews on event cards
- **Review Management** - View, edit, delete your reviews

### ✅ User Profile
- **Profile Management** - View and edit user information
- **Edit Profile** - Update name, email, phone
- **Account Status** - Display membership information
- **User Avatar** - Display user profile icon

### ✅ UI/UX Components
- **Toast Notifications** - Success/error/info/warning messages
- **Loading Spinners** - Smooth loading states
- **Modal Dialogs** - Booking confirmation modals
- **Smooth Animations** - Fade-in, slide transitions
- **Error Handling** - User-friendly error messages

## 🏗️ Project Structure

```
/src
  /pages
    - Login.jsx (Custom email/password auth)
    - Signup.jsx (User registration)
    - Dashboard.jsx (Main events listing)
    - MyBookings.jsx (User's booked events)
    - Profile.jsx (User profile management)
    - Home.jsx (Existing home page)
    - EventDetail.jsx (Event details - existing)
    
  /components
    - Sidebar.jsx (Navigation sidebar)
    - EventCard.jsx (Event listing card)
    - Toast.jsx (Notification component)
    - LoadingSpinner.jsx (Loading state)
    
  /context
    - AuthContext.jsx (Auth state management)
    
  /hooks
    - useAuth.js (Custom auth hook)
    
  /services
    - auth.js (Authentication logic)
    - supabase.js (Supabase client config)
    - events.js (Events API)
    - bookings.js (Bookings API)
    - reviews.js (Reviews API - existing)
    - categories.js (Categories - existing)
```

## 📦 Database Tables

### Users Table
```sql
- user_id (PRIMARY KEY)
- name, email, phone
- password
- first_name, last_name
- created_at
```

### Events Table
```sql
- event_id (PRIMARY KEY)
- title, description, venue
- event_date, price
- total_seats, available_seats
- image_url
```

### Bookings Table
```sql
- booking_id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- event_id (FOREIGN KEY)
- num_tickets, total_price
- booking_date, status
```

### Reviews Table
```sql
- review_id (PRIMARY KEY)
- user_id, event_id (FOREIGN KEYS)
- rating (1-5), comment
- review_date
```

### Categories, Event_Categories, Organizers, Event_Organizers
- Mapping tables for many-to-many relationships

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account with properly configured tables

### Installation

1. **Clone and install dependencies**
```bash
cd EventSphere
npm install
```

2. **Configure Supabase**
   - Create `.env.local` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Ensure all Supabase tables exist**
   - users, events, bookings, reviews, categories, event_categories, organizers, event_organizers

4. **Start development server**
```bash
npm run dev
```
Server runs on http://localhost:5173/

## 🔐 Authentication Flow

```
1. User visits /login (default first screen)
   ↓
2. Enters email + password
   ↓
3. System queries users table
   ↓
4. If valid: Store user in localStorage + AuthContext
   ↓
5. Redirect to /dashboard
   ↓
6. User can now access all protected routes
```

### Create Account Flow
```
1. User clicks "Create Account" → /signup
2. Fills name, email, phone, password
3. System inserts into users table
4. Auto-redirect to /login with success message
5. User logs in with new credentials
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple-500 to Blue-500 gradients
- **Background**: Slate-900 with semi-transparent overlays
- **Text**: White/Gray-300 on dark backgrounds
- **Status**: Green (success), Red (error), Blue (info)

### UI Components
- **Glassmorphism**: backdrop-blur-md + transparent backgrounds
- **Animations**: fadeInRight, slideInDown, smooth transitions
- **Responsive**: Mobile-first design, md/lg breakpoints
- **Accessibility**: Proper semantic HTML, focus states

## 📱 Responsive Design

- **Mobile**: Full-screen, touch-friendly buttons
- **Tablet**: Sidebar collapses to hamburger menu
- **Desktop**: Full sidebar + content layout

## 🧪 Testing Checklist

### Authentication
- [ ] Login with valid credentials → redirects to dashboard
- [ ] Login with invalid credentials → shows error message
- [ ] Signup creates new user → can login immediately after
- [ ] Logout clears session → redirects to login
- [ ] Refresh page → user stays logged in (localStorage)

### Bookings
- [ ] Click "Book Now" → Opens booking modal
- [ ] Select tickets → Updates total price
- [ ] Confirm booking → Reduces available seats
- [ ] View in "My Bookings" → Shows booked event details
- [ ] Cancel booking → Restores available seats

### Reviews
- [ ] Submit review → Appears on event card
- [ ] Rating updates average → Shows on event card
- [ ] Multiple reviews → Increases review count

### Profile
- [ ] View profile → Shows user information
- [ ] Edit profile → Updates user data in Supabase
- [ ] Logout from profile → Works correctly

## 🔄 Real-time Sync

All data updates are synced with Supabase in real-time:
- Bookings immediately update seat counts
- Reviews appear instantly on event cards
- User profile changes persist across sessions

## 🎯 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Custom Auth | ✅ | Email/password login (no Google) |
| Dashboard | ✅ | Browse all events with real-time data |
| Event Booking | ✅ | Select tickets, auto-reduce seats |
| My Bookings | ✅ | View & cancel bookings |
| Reviews | ✅ | Rate events (1-5 stars) |
| Categories | ✅ | Filter events by type |
| Profile | ✅ | View & edit user info |
| Responsive | ✅ | Mobile, tablet, desktop |
| Toast Notifications | ✅ | Success/error messages |
| Loading States | ✅ | Smooth spinners |

## 🚨 Important Notes

1. **Passwords**: Currently stored in plain text for demo. In production:
   - Hash passwords with bcrypt
   - Implement server-side auth
   - Use HTTPS

2. **Session Management**:
   - Uses localStorage for persistence
   - No automatic expiration (add for security)
   - Clear data on logout

3. **Error Handling**:
   - All API errors display user-friendly messages
   - Network errors trigger toast notifications
   - Fallback for missing data

4. **Performance**:
   - Lazy loading for event images
   - Optimized queries with relations
   - Minimal re-renders with React hooks

## 🔧 Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📚 API Services

### Auth Service
```javascript
loginUser(email, password)
registerUser(name, email, phone, password)
getUserById(userId)
updateUserProfile(userId, updates)
```

### Events Service
```javascript
getAllEvents(categoryId)
getEventById(eventId)
getUpcomingEvents()
searchEvents(query)
decreaseAvailableSeats(eventId, count)
increaseAvailableSeats(eventId, count)
```

### Bookings Service
```javascript
createBooking(bookingData)
getUserBookings(userId)
cancelBooking(bookingId, eventId, numTickets)
getEventBookings(eventId)
hasUserBookedEvent(userId, eventId)
```

### Reviews Service
```javascript
createReview(reviewData)
getEventReviews(eventId)
updateReview(reviewId, reviewData)
deleteReview(reviewId)
getEventAverageRating(eventId)
hasUserReviewedEvent(userId, eventId)
```

## 🎓 Learning Resources

- React Hooks: https://react.dev/reference/react
- Tailwind CSS: https://tailwindcss.com/docs
- Supabase: https://supabase.com/docs
- React Router: https://reactrouter.com/

## 📄 License

MIT License - Free to use and modify

## 👥 Support

For issues or questions, check:
1. Console for error messages
2. Network tab for failed API calls
3. LocalStorage for auth data
4. Supabase dashboard for data validation

---

**Built with ❤️ using React, Vite, Tailwind CSS, and Supabase**

Deploy ready! No Google authentication, fully functional with real Supabase data.
