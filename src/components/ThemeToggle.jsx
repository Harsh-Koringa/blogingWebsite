import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(initialDark)
    document.documentElement.classList.toggle('dark', initialDark)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`
        flex items-center justify-center
        h-9 w-9 rounded-xl
      
        text-neutral-600 dark:text-neutral-300
        
        transition-colors duration-200 ease-in-out
        
      `}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-black" />
      )}
    </motion.button>
  )
}

export default ThemeToggle
