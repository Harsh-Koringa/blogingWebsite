import React from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
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