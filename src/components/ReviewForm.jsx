import { useState } from 'react'
import RatingStars from './RatingStars'
import { reviewsService } from '../services/reviews'

export default function ReviewForm({ eventId, userId, onReviewSubmitted, existingReview = null }) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setMessage('Please select a rating')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      let result
      if (existingReview?.review_id) {
        result = await reviewsService.updateReview(
          existingReview.review_id,
          rating,
          comment
        )
      } else {
        result = await reviewsService.addReview(userId, eventId, rating, comment)
      }

      if (result.success) {
        setMessage('✓ Review submitted successfully!')
        setRating(0)
        setComment('')
        setTimeout(() => {
          onReviewSubmitted()
        }, 1000)
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('Failed to submit review')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this review?')) return

    setLoading(true)
    try {
      const result = await reviewsService.deleteReview(existingReview.review_id)
      if (result.success) {
        setMessage('✓ Review deleted successfully!')
        setTimeout(() => {
          onReviewSubmitted()
        }, 1000)
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('Failed to delete review')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
          message.includes('✓') ? 'bg-green-900/50 border border-green-700 text-green-200' : 'bg-red-900/50 border border-red-700 text-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Rating</label>
        <RatingStars
          rating={rating}
          size="lg"
          interactive={true}
          onRate={setRating}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Comment (Optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          placeholder="Share your experience..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 resize-none transition"
          rows="4"
        />
        <p className="text-gray-500 text-sm mt-1">{comment.length}/500</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 active:scale-95"
        >
          {loading ? '⏳ Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
        </button>
        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2.5 border border-red-500/50 hover:bg-red-500/20 text-red-300 font-semibold rounded-xl transition-all duration-300"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
