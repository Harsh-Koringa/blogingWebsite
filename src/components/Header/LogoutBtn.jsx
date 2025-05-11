import React from 'react'
import { useDispatch } from 'react-redux'
import authService from '../../appwrite/auth'
import { logout } from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        authService.logout().then(() => {
            dispatch(logout())
        })
    }
  return (
    <button   className='w-full text-left px-6 py-2 rounded-lg text-black text-2xl font-bold font-serif tracking-wide hover:bg-gray-100'
    onClick={logoutHandler}>LogOut</button>
  )
}

export default LogoutBtn