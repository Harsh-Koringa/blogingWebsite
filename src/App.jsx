import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import authService from './appwrite/auth'
import './App.css'
import { login, logout } from './store/authSlice'
import { Header, Footer } from './components'
import { Outlet } from 'react-router-dom'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Theme initialization
    const initializeTheme = () => {
      if (localStorage.theme === 'dark' ||
        (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Initialize theme
    initializeTheme()

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = (e) => {
      if (!localStorage.theme) {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
    mediaQuery.addEventListener('change', handleThemeChange)

    // Auth check
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login({ userData }))
        } else {
          dispatch(logout())
        }
      })
      .finally(() => { })

    return () => mediaQuery.removeEventListener('change', handleThemeChange)
  }, [])

  return (
    <div className='min-h-screen flex flex-col bg-base text-base transition-colors'>
      <Header />
      <main className='flex-grow'>
        <AnimatePresence mode='wait'>
          <Outlet />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App
