import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`
        glass-card
        flex items-center justify-center
        h-9 w-9 rounded-xl
        theme-transition
      `}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </motion.button>
  )
}

export default ThemeToggle
