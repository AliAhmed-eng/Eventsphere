import React from 'react'

export default function CategoryFilter({ categories, selectedCategories, onCategoryChange }) {
  const toggleCategory = (name) => {
    if (selectedCategories.includes(name)) {
      onCategoryChange(selectedCategories.filter(c => c !== name))
    } else {
      onCategoryChange([...selectedCategories, name])
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl sticky top-24">
      <h3 className="text-xl font-bold mb-4">Categories</h3>

      {categories.length === 0 ? (
        <p className="text-gray-400">No categories available</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category.category_id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.category_name)}
                onChange={() => toggleCategory(category.category_name)}
                className="w-4 h-4 bg-gray-800 border border-gray-600 rounded cursor-pointer accent-purple-600"
              />
              <span className="text-gray-300 group-hover:text-white transition">
                {category.category_name}
              </span>
            </label>
          ))}
        </div>
      )}

      {selectedCategories.length > 0 && (
        <button
          onClick={() => onCategoryChange([])}
          className="w-full mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition text-sm"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
