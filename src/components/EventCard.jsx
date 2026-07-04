import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { getEventImage } from "../utils/eventImage";
import { formatCurrency } from "../utils/currency";

function EventCard({ event, onBook, rating: propRating, totalReviews: propTotalReviews, categories: propCategories }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const [userId, setUserId] = useState(null);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);

    if (id && event?.event_id) {
      const wishlistKey = `wishlist_${id}`;
      const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");
      setIsWishlisted(wishlist.some(item => item.event_id === event.event_id));
    }

    // Re-check cart status on storage/cartUpdated events
    const onCartChange = () => setCartLoaded(prev => !prev);
    window.addEventListener("cartUpdated", onCartChange);
    window.addEventListener("storage", onCartChange);
    return () => {
      window.removeEventListener("cartUpdated", onCartChange);
      window.removeEventListener("storage", onCartChange);
    };
  }, [event, cartLoaded]);

  useEffect(() => {
    if (propRating !== undefined) {
      setRating(propRating);
      setReviewCount(propTotalReviews || 0);
    } else if (event?.reviews) {
      const total = event.reviews.length;
      const avg = total > 0
        ? event.reviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;
      setRating(avg);
      setReviewCount(total);
    }
  }, [event, propRating, propTotalReviews]);

  const getUserId = () => {
    const cu = JSON.parse(localStorage.getItem("current_user") || "{}");
    if (cu?.user_id) return cu.user_id;
    const esu = JSON.parse(localStorage.getItem("eventSphereUser") || "{}");
    if (esu?.id) return esu.id;
    const uid = localStorage.getItem("user_id");
    if (uid) return uid;
    const fu = JSON.parse(localStorage.getItem("user") || "{}");
    if (fu?.id) return fu.id;
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !event?.event_id) return;

    const wishlistKey = `wishlist_${userId}`;
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");

    if (isWishlisted) {
      const updated = wishlist.filter(item => item.event_id !== event.event_id);
      localStorage.setItem(wishlistKey, JSON.stringify(updated));
      setIsWishlisted(false);
    } else {
      wishlist.push({
        wishlist_id: Date.now(),
        user_id: userId,
        event_id: event.event_id,
        events: {
          event_id: event.event_id,
          title: event.title,
          venue: event.venue,
          event_date: event.event_date,
          price: event.price,
          available_seats: event.available_seats,
        }
      });
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = cart.some(item => item.event_id === event.event_id);
    if (!exists) {
      cart.push({
        event_id: event.event_id,
        title: event.title,
        venue: event.venue,
        event_date: event.event_date,
        price: event.price,
        image_url: null,
        available_seats: event.available_seats,
        quantity: 1
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
      setCartMsg("Added to cart");
    } else {
      setCartMsg("Already in cart");
    }
    setTimeout(() => setCartMsg(""), 2000);
  };

  const seatColor = event?.available_seats === 0
    ? "bg-red-500/20 text-red-300 border-red-500/30"
    : event?.available_seats <= 5
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  const categories = propCategories || event?.event_categories || [];

  return (
    <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {(() => {
          const img = getEventImage(event)
          return (
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110"
              style={{ background: `linear-gradient(135deg, ${img.gradient[0]}, ${img.gradient[1]}, ${img.gradient[2]})` }}
            >
              <div className="flex flex-col items-center gap-1 select-none">
                <div className="text-5xl opacity-30">{img.emoji}</div>
                <div className="text-white/20 text-lg font-bold tracking-widest">{img.initials}</div>
              </div>
            </div>
          )
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />

        {/* Wishlist Heart */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-300 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-white/70 hover:text-red-400"
            }`}
          />
        </button>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="absolute top-3 left-16 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 hover:border-green-500/50"
        >
          <ShoppingCart className="w-5 h-5 text-white/70 hover:text-green-400 transition-colors duration-300" />
        </button>

        {cartMsg && (
          <div className="absolute top-16 left-3 z-20 px-3 py-1.5 bg-green-500/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-white animate-fadeInRight">
            {cartMsg}
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-bold text-sm shadow-lg shadow-purple-500/30">
          {formatCurrency(event?.price)}
        </div>

        {/* Category Badge */}
        {categories.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium text-white/90">
              {categories[0]?.category_name || categories[0]?.categories?.category_name || "Event"}
            </span>
          </div>
        )}

        {/* Seats Left Badge */}
        <div className={`absolute bottom-3 right-3 z-10 px-2.5 py-1 backdrop-blur-sm border rounded-full text-xs font-semibold ${seatColor}`}>
          {event?.available_seats === 0 ? "Sold Out" : `${event?.available_seats} left`}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <Link to={`/events/${event?.event_id}`}>
          <h3 className="text-lg font-bold text-white leading-tight transition-colors duration-300 group-hover:text-purple-400 line-clamp-2">
            {event?.title}
          </h3>
        </Link>

        {/* Venue & Date */}
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1.5 truncate">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event?.venue}</span>
          </span>
          <span className="shrink-0">•</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event?.event_date)}</span>
          </span>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm transition-colors ${
                  star <= Math.round(rating) ? "text-yellow-400" : "text-gray-600"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {rating > 0 ? rating.toFixed(1) : "No ratings"}
            {reviewCount > 0 && ` (${reviewCount})`}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              if (onBook) {
                onBook(event);
              } else {
                navigate(`/events/${event?.event_id}`);
              }
            }}
            disabled={event?.available_seats === 0}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
          >
            {event?.available_seats === 0 ? "Sold Out" : "Book Now"}
          </button>
          <Link
            to={`/events/${event?.event_id}`}
            className="flex-1 px-4 py-2.5 border border-white/20 hover:border-purple-500/50 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-white/5 text-center active:scale-95"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
