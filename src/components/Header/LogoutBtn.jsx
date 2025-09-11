import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import authService from '../../appwrite/auth.jsx'
import { logout } from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const logoutHandler = async () => {
        try {
            // Dispatch logout first to update UI immediately
            dispatch(logout())

            // Clear all auth-related storage
            localStorage.removeItem('auth_token')
            localStorage.removeItem('userProfile')

            // Navigate immediately to prevent any authenticated route access
            navigate('/', { replace: true })

            // Then complete the backend logout
            await authService.logout()
        } catch (error) {
            console.error('Logout error:', error)
            // Even if backend logout fails, keep the user logged out locally
        }
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logoutHandler}
            className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-md
                text-sm font-medium text-red-600 dark:text-red-500
                hover:bg-red-50 dark:hover:bg-red-950/30
                border border-red-200 dark:border-red-900
                transition-colors duration-200
            `}
        >
            <LogOut className="h-4 w-4" />
            Sign out
        </motion.button>
    )
}

export default LogoutBtn