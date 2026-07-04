import { useState } from 'react'

export default function RatingStars({ rating, size = 'md', interactive = false, onRate = null }) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={`${sizeClasses[size]} transition-all duration-150 ${
            star <= displayRating ? 'text-yellow-400' : 'text-gray-600'
          } ${interactive ? 'cursor-pointer hover:scale-125 hover:text-yellow-300' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
