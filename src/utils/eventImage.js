const gradients = [
  ['#7c3aed', '#2563eb', '#3730a3'],
  ['#10b981', '#14b8a6', '#0d9488'],
  ['#f97316', '#ec4899', '#be185d'],
  ['#3b82f6', '#6366f1', '#5b21b6'],
  ['#eab308', '#f59e0b', '#ea580c'],
  ['#06b6d4', '#3b82f6', '#7c3aed'],
  ['#ec4899', '#f43f5e', '#be123c'],
  ['#84cc16', '#22c55e', '#047857'],
  ['#8b5cf6', '#a855f7', '#c026d3'],
  ['#14b8a6', '#06b6d4', '#1d4ed8'],
]

const emojiMap = [
  { keywords: ['tech', 'code', 'software', 'hackathon', 'developer', 'programming', 'digital', 'ai', 'blockchain', 'data'], emoji: '💻' },
  { keywords: ['concert', 'music', 'live', 'band', 'festival', 'dj', 'orchestra', 'symphony', 'gig', 'show'], emoji: '🎵' },
  { keywords: ['workshop', 'training', 'learn', 'course', 'seminar', 'class', 'education', 'lecture', 'tutorial', 'masterclass'], emoji: '📚' },
  { keywords: ['art', 'design', 'creative', 'craft', 'painting', 'drawing', 'photography', 'exhibition', 'gallery', 'museum'], emoji: '🎨' },
  { keywords: ['business', 'startup', 'entrepreneur', 'corporate', 'marketing', 'finance', 'investment', 'pitch', 'venture'], emoji: '💼' },
  { keywords: ['health', 'wellness', 'fitness', 'yoga', 'meditation', 'therapy', 'mental', 'sports', 'exercise', 'nutrition'], emoji: '🧘' },
  { keywords: ['food', 'cooking', 'culinary', 'restaurant', 'dining', 'tasting', 'baking', 'cuisine', 'chef', 'gourmet'], emoji: '🍽️' },
  { keywords: ['network', 'networking', 'community', 'meetup', 'social', 'conference', 'forum', 'gathering', 'connect'], emoji: '🤝' },
  { keywords: ['sports', 'game', 'tournament', 'competition', 'match', 'race', 'marathon', 'olympic', 'championship', 'league'], emoji: '🏆' },
  { keywords: ['movie', 'film', 'cinema', 'theatre', 'drama', 'stage', 'performance', 'broadway', 'screening'], emoji: '🎭' },
  { keywords: ['charity', 'fundraiser', 'volunteer', 'nonprofit', 'donation', 'cause', 'awareness', 'relief'], emoji: '❤️' },
  { keywords: ['travel', 'adventure', 'trip', 'tour', 'explore', 'wander', 'expedition', 'vacation', 'holiday'], emoji: '✈️' },
  { keywords: ['fashion', 'beauty', 'style', 'model', 'runway', 'trend', 'couture'], emoji: '👗' },
  { keywords: ['science', 'research', 'lab', 'experiment', 'discovery', 'innovation', 'engineering', 'physics', 'chemistry'], emoji: '🔬' },
]

function getGradient(event) {
  const idx = (event.event_id || 1) % gradients.length
  return gradients[idx]
}

function getEmoji(event) {
  const title = (event.title || '').toLowerCase()
  for (const entry of emojiMap) {
    if (entry.keywords.some(k => title.includes(k))) {
      return entry.emoji
    }
  }
  const emojis = ['🎭', '🎪', '🎯', '🎲', '🎸', '🎤', '🎨', '📡', '🎬', '🌟']
  return emojis[(event.event_id || 0) % emojis.length]
}

function getInitials(event) {
  const title = event.title || ''
  return title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'EV'
}

export function getEventImage(event) {
  if (!event) return { gradient: gradients[0], emoji: '🎭', initials: 'EV' }
  return {
    gradient: getGradient(event),
    emoji: getEmoji(event),
    initials: getInitials(event),
  }
}
