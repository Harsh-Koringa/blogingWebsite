import React from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import authService from '../../appwrite/auth'
import { logout } from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = React.useState(false)

    const logoutHandler = async () => {
        try {
            setIsLoading(true)
            await authService.logout()
            dispatch(logout())
            // Force a page reload to clear any cached state
            window.location.href = '/'
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logoutHandler}
            disabled={isLoading}
            className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-md
                text-sm font-medium text-red-600 dark:text-red-500
                hover:bg-red-50 dark:hover:bg-red-950/30
                border border-red-200 dark:border-red-900
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            <LogOut className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Signing out...' : 'Sign out'}
        </motion.button>
    )
}

export default LogoutBtn