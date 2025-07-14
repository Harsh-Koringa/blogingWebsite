import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import authService from '../appwrite/auth'
import { login as authLogin } from '../store/authSlice'
import { Button, Input, Logo } from './index'

function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { register, handleSubmit } = useForm()
    const [error, setError] = useState("")

    const login = async (data) => {
        setError("")
        try {
            const session = await authService.login(data.email, data.password)
            if (session) {
                const userData = await authService.getCurrentUser()
                if (userData) dispatch(authLogin({ userData }))
                navigate("/")
            }
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-sm"
            >
                <div className="mb-6 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/signup"
                        className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 text-center text-sm font-medium text-destructive"
                    >
                        {error}
                    </motion.p>
                )}

                <form onSubmit={handleSubmit(login)} className="mt-8">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Please enter a valid email"
                                    }
                                })}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-10"
                                {...register("password", {
                                    required: "Password is required"
                                })}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Sign in
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default Login