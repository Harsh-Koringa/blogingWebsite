import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, FileText, PlusCircle, Moon, Sun } from 'lucide-react'
import { Container, Logo, LogoutBtn } from '../index'
import ThemeToggle from '../ThemeToggle'

function Header() {
  const authStatus = useSelector(state => state.auth.status)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-base/80 backdrop-blur-lg">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) =>
              item.active && (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.slug)}
                  className="text-sm font-medium text-base hover:opacity-80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                </motion.button>

              )
            )}
            <ThemeToggle />
            {authStatus && <LogoutBtn />}
          </nav>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
            className="md:hidden border-t border-gray-200 dark:border-gray-800"
          >
            <nav className="grid gap-2 px-4 py-4 bg-white dark:bg-neutral-900 shadow-lg transition-colors duration-300">
              {navItems.map(
                (item) =>
                  item.active && (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavigation(item.slug)}
                      className="flex items-center gap-2 w-full p-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </motion.button>
                  )
              )}

              <div className="flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-700 mt-3">
                <ThemeToggle />
              </div>

            </nav>

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
