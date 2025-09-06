import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Home, FileText, PlusCircle,
  Search, Bell, BookmarkPlus, User
} from 'lucide-react'
import { Container, Logo, LogoutBtn } from '../index'
import ThemeToggle from '../ThemeToggle'

function Header() {
  const authStatus = useSelector(state => state.auth.status)
  const userData = useSelector(state => state.auth.userData)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(true)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    {
      name: 'Home',
      slug: '/',
      icon: Home,
      active: true
    },
    {
      name: "Profile",
      slug: '/profile',
      icon: FileText,
      active: authStatus
    },
    {
      name: "Login",
      slug: '/login',
      icon: FileText,
      active: !authStatus
    },
    {
      name: "Signup",
      slug: '/signup',
      icon: FileText,
      active: !authStatus
    },
    {
      name: "All Posts",
      slug: '/all-posts',
      icon: FileText,
      active: authStatus
    },
    {
      name: "Add Post",
      slug: '/add-post',
      icon: PlusCircle,
      active: authStatus
    }
  ]

  const handleNavigation = (slug) => {
    setIsMobileMenuOpen(false)
    navigate(slug)
  }



  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-card border-b border-glass-border bg-glass-bg">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Logo wrapper={Link} className="gradient-text-primary" />

            {/* Search Bar */}
            {/*<div
              ref={searchRef}
              className={`hidden md:flex items-center transition-all duration-400 ease-in-out ${isSearchExpanded ? 'w-96' : 'w-12'
                }`}
            >
              <motion.div
                className="relative w-full"
                layout
              >
                <input
                  type="search"
                  placeholder="Search posts..."
                  className={`
                  glass-card w-full h-10 pl-10 pr-4 rounded-full
                  text-sm outline-none transition-all duration-300
                  ${isSearchExpanded ? 'opacity-100' : 'opacity-0 cursor-pointer'}
                `}
                  onFocus={() => setIsSearchExpanded(true)}
                />
                <Search
                  className={`absolute left-3 top-2.5 h-5 w-5 transition-colors ${isSearchExpanded ? 'text-gray-400' : 'text-gray-600 cursor-pointer'
                    }`}
                  onClick={() => setIsSearchExpanded(true)}
                />
              </motion.div>
            </div>*/}

            <nav className="hidden md:flex items-center gap-4">
              {navItems.map((item) =>
                item.active && (
                  <motion.button
                    key={item.name}
                    onClick={() => handleNavigation(item.slug)}
                    className="text-sm font-medium hover:text-primary theme-transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                  </motion.button>
                )
              )}

              {authStatus && (
                <>
                  {/* Notification Bell */}
                  {/*<motion.button
                    className="relative p-2 hover:text-primary theme-transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="h-5 w-5" />
                    {hasNotifications && (
                      <motion.span
                        className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.button>*/}

                  {/* User Menu */}
                  <div ref={userMenuRef} className="relative">
                    <motion.button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="glass-card p-2 rounded-full hover:scale-105 theme-transition"
                      whileTap={{ scale: 0.95 }}
                    >
                      <User className="h-5 w-5" />
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-lg"
                        >
                          <div className="p-2 space-y-1">
                            <button
                              onClick={() => handleNavigation('/profile')}
                              className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-glass-bg theme-transition"
                            >
                              Profile
                            </button>
                            <button
                              onClick={() => handleNavigation('/bookmarks')}
                              className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-glass-bg theme-transition"
                            >
                              Bookmarks
                            </button>
                            <LogoutBtn />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              <ThemeToggle />
            </nav>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden glass-card p-2 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </Container>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden border-t border-glass-border"
            >
              <nav className="grid gap-2 px-4 py-4 glass-card shadow-lg">
                {/* Mobile Search */}
                {/*<div className="relative mb-2">
                  <input
                    type="search"
                    placeholder="Search posts..."
                    className="glass-card w-full h-10 pl-10 pr-4 rounded-full text-sm"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>*/}

                {navItems.map(
                  (item) =>
                    item.active && (
                      <motion.button
                        key={item.name}
                        onClick={() => handleNavigation(item.slug)}
                        className="flex items-center gap-2 w-full p-2 text-sm font-medium hover:bg-glass-bg rounded-lg theme-transition"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </motion.button>
                    )
                )}

                {authStatus && (
                  <>
                    
                    <div className="px-2">
                      <LogoutBtn className="w-full justify-center" />
                    </div>
                    {/* Notification button - commented out for now
                    <motion.button
                      className="flex items-center gap-2 w-full p-2 text-sm font-medium hover:bg-glass-bg rounded-lg theme-transition"
                    >
                      <Bell className="h-5 w-5" />
                      Notifications
                      {hasNotifications && (
                        <span className="h-2 w-2 bg-red-500 rounded-full" />
                      )}
                    </motion.button> */}
                  </>
                )}

                <div className="flex justify-end pt-3 border-t border-glass-border mt-3">
                  <ThemeToggle />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Action Button */}
      {authStatus && (
        <motion.button
          onClick={() => handleNavigation('/add-post')}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg gradient-bg-primary"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -10, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <PlusCircle className="h-6 w-6 text-white" />
        </motion.button>
      )}
    </>
  )
}

export default Header
