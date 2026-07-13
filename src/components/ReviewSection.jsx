import RatingStars from './RatingStars'

export default function ReviewSection({ reviews, averageRating, totalReviews, showForm }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-6">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 break-words">Reviews & Ratings</h3>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-white/10">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-2">
            {averageRating > 0 ? averageRating : '—'}
          </div>
          <div className="flex justify-center">
            <RatingStars rating={averageRating} size="md" />
          </div>
          <p className="text-gray-400 mt-2">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(r => r.rating === stars).length
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm min-w-8">{stars}★</span>
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-400 text-sm min-w-8">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-8">
          {showForm}
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4">
          {reviews.length > 0 ? `All Reviews (${reviews.length})` : 'No reviews yet'}
        </h4>

        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.review_id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                      {(review.users?.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {review.users?.name || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                </div>

                {review.comment && (
                  <p className="text-gray-300 text-sm mt-2 sm:ml-12 break-words">{review.comment}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Be the first to review this event!</p>
          )}
        </div>
      </div>
    </div>
  )
}
