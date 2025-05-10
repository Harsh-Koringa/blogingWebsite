import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import authService from './appwrite/auth'
import './App.css'
import { login, logout } from './store/authSlice'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import { Outlet } from 'react-router-dom'
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getCurrentUser()
      .then((userData) => {
        //console.log("Current user from Appwrite:", userData);
        if (userData) {
          dispatch(login({ userData }))
        } else {
          dispatch(logout())
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return !loading ? (
    <div className='min-h-screen flex flex-col' style={{ backgroundColor: '#FFFFFF' }}>


      <Header />

      <main className='flex-grow pt-[56px]'>  
        <Outlet />
      </main>
      <Footer />
    </div>
    


  ) : null
}

export default App
