import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import authService from '../appwrite/auth.jsx'
import { login as authLogin } from '../store/authSlice'
import { Button, Input, Logo } from './index'

function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm()
    const [error, setError] = useState("")
    const [step, setStep] = useState("email") // "email" or "otp"
    const [email, setEmail] = useState("")

    // Pre-fill email if redirected from signup
    useEffect(() => {
        if (location.state?.email) {
            setValue("email", location.state.email);
        }
    }, [location.state, setValue])

    const requestOTP = async (data) => {
        setError("")
        try {
            await authService.sendOTP(data.email)
            setEmail(data.email)
            setStep("otp")
        } catch (error) {
            if (error.message.includes("No account found")) {
                // Add a small delay before redirecting to make sure the error message is seen
                setError("No account found. Redirecting to signup...");
                setTimeout(() => {
                    navigate("/signup", {
                        state: { email: data.email } // Pass email to signup form
                    });
                }, 2000);
            } else {
                setError(error.message);
            }
        }
    }

    const verifyOTP = async (data) => {
        setError("")
        try {
            const success = await authService.verifyOTP(email, data.otp)
            if (success) {
                // Get the complete user data including profile
                const userData = await authService.getCurrentUser()
                if (userData) {
                    console.log('Login: Got user data:', userData);
                    // Update Redux store with complete user data
                    dispatch(authLogin({ userData }))
                    // Ensure localStorage has the auth token
                    if (!localStorage.getItem('auth_token')) {
                        const token = userData.token || success.token
                        if (token) localStorage.setItem('auth_token', token)
                    }
                    navigate("/")
                } else {
                    throw new Error('Failed to get user data')
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Failed to complete login')
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

                {step === "email" ? (
                    <form onSubmit={handleSubmit(requestOTP)} className="mt-8">
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
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 font-semibold text-primary-foreground shadow-lg group relative overflow-hidden backdrop-blur-sm"
                                >
                                    <motion.span
                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                                    />
                                    <span className="relative">
                                        {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit(verifyOTP)} className="mt-8">
                        <div className="space-y-4">
                            {/* Show email field disabled */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="pl-10 bg-muted/30"
                                />
                            </div>

                            {/* OTP input field */}
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="pl-10"
                                    {...register("otp", {
                                        required: "OTP is required",
                                        pattern: {
                                            value: /^\d{6}$/,
                                            message: "Please enter a valid 6-digit OTP"
                                        }
                                    })}
                                />
                            </div>

                            <div className="text-sm text-muted-foreground text-center">
                                <div className="mb-2">
                                    We've sent a verification code to<br />
                                    <span className="font-medium text-foreground">{email}</span>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep("email");
                                            setError("");
                                        }}
                                        className="text-primary hover:underline"
                                    >
                                        Change email
                                    </button>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit(requestOTP)()}
                                        className="text-primary hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </div>
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 font-semibold text-primary-foreground shadow-lg group relative overflow-hidden backdrop-blur-sm"
                                >
                                    <motion.span
                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                                    />
                                    <span className="relative">
                                        {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    )
}

export default Login