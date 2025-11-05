'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { BackButton } from './BackButton'
import { LogoutButton } from './LogoutButton'

interface AppHeaderProps {
  readonly title: string
  readonly showBack?: boolean
  readonly backFallbackUrl?: string
  readonly className?: string
}

export function AppHeader({ 
  title, 
  showBack = true, 
  backFallbackUrl,
  className = '' 
}: AppHeaderProps) {
  const { authState } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const userInitial = authState.user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <header className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {showBack && (
              <BackButton fallbackUrl={backFallbackUrl} />
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          {authState.isAuthenticated && (
            <div className="relative" ref={menuRef}>
              {/* User Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="User menu"
                aria-expanded={isMenuOpen}
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {authState.user?.name || 'User'}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{authState.user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500 truncate">{authState.user?.email}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{authState.user?.role?.toLowerCase()}</p>
                    </div>
                    
                    {/* Logout Button */}
                    <div className="py-1">
                      <LogoutButton 
                        className="w-full text-left justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-none hover:text-red-600"
                        showIcon={true}
                      >
                        Log out
                      </LogoutButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
