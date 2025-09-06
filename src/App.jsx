import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import authService from './appwrite/auth'
import './App.css'
import './styles/theme.css'
import { login, logout } from './store/authSlice'
import { Header, Footer } from './components'
import { Outlet } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Auth check
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login({ userData }))
        } else {
          dispatch(logout())
        }
      })
      .catch((error) => {
        console.error('Auth check failed:', error)
        dispatch(logout())
      })
  }, [dispatch])

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-base text-base theme-transition">
        <Header />
        <AnimatePresence mode="wait">
          <main className="flex-grow">
            <Outlet />
          </main>
        </AnimatePresence>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
