'use client'
import { useState, useMemo } from 'react'

interface SearchFilterProps<T> {
  data: T[]
  searchFields: (keyof T)[]
  filterFields?: {
    field: keyof T
    label: string
    options: string[]
  }[]
  onFilteredDataChange?: (filteredData: T[]) => void
  placeholder?: string
}

export function SearchFilter<T extends Record<string, any>>({
  data,
  searchFields,
  filterFields = [],
  onFilteredDataChange,
  placeholder = 'Search...',
}: SearchFilterProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return value && String(value).toLowerCase().includes(query)
        })
      )
    }

    // Apply filters
    filterFields.forEach(({ field }) => {
      const filterValue = activeFilters[field as string]
      if (filterValue && filterValue !== 'all') {
        result = result.filter(item => String(item[field]) === filterValue)
      }
    })

    // Notify parent of filtered data
    if (onFilteredDataChange) {
      onFilteredDataChange(result)
    }

    return result
  }, [data, searchQuery, activeFilters, searchFields, filterFields, onFilteredDataChange])

  const handleFilterChange = (field: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setActiveFilters({})
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {filterFields.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {filterFields.map(({ field, label, options }) => (
            <div key={String(field)} className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <select
                value={activeFilters[field as string] || 'all'}
                onChange={(e) => handleFilterChange(field as string, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All {label}</option>
                {options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {(searchQuery || Object.values(activeFilters).some(v => v && v !== 'all')) && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} results
      </div>
    </div>
  )
}

