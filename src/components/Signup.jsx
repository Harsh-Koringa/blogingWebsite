import React, { useState, useEffect } from 'react'
import authService from '../appwrite/auth.jsx'
import appwriteService from '../appwrite/config'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../store/authSlice'
import { Button, Input, Logo } from './index.js'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

function Signup() {
    const navigate = useNavigate()
    const location = useLocation()
    const [error, setError] = useState("")
    const [step, setStep] = useState("form") // "form", "otp"
    const [signupData, setSignupData] = useState(null)
    const dispatch = useDispatch()
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm()

    // Pre-fill email if redirected from login
    useEffect(() => {
        if (location.state?.email) {
            setValue("email", location.state.email);
        }
    }, [location.state, setValue])

    const requestSignup = async (data) => {
        setError("");

        // Validate username
        if (data.username.length < 3) {
            setError("Username must be at least 3 characters long");
            return;
        }

        try {
            const { exists } = await authService.checkUserExists(data.email);
            if (exists) {
                setError('Account already exists. Redirecting to login…');
                setTimeout(
                    () => navigate('/login', { state: { email: data.email } }),
                    2_000
                );
                return;                       // ⬅️ stop here; no OTP, no createAccount
            }
        } catch (err) {
            console.error('Email-check failed:', err);
            setError('Could not verify email. Please try again.');
            return;
        }

        try {
            // This will send OTP
            const result = await authService.createAccount(
                data.email,
                data.username,
                data.name
            );

            setSignupData(result);
            setStep("otp");
        } catch (error) {
            console.error("Signup error:", error);
            if (error.message.includes("logout before creating")) {
                setError("You are already logged in. Please log out first.");
            } else {
                setError(error.message || "Failed to start signup process. Please try again.");
            }
        }
    }

    const verifyAndComplete = async (data) => {
        try {
            const userData = await authService.completeSignup(
                signupData.email,
                signupData.username,
                signupData.name,
                data.otp
            );

            if (userData) {
                // Update Redux store
                dispatch(login({ userData }));
                // Ensure localStorage has the auth token (should be set by completeSignup, but double-check)
                if (!localStorage.getItem('auth_token')) {
                    const token = userData.token
                    if (token) localStorage.setItem('auth_token', token)
                }
                navigate("/");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setError(error.message || "Failed to verify OTP. Please try again.");
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
                <h2 className="text-center text-2xl font-bold leading-tight">Sign up to create account</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                    >
                        Sign In
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

                {step === "form" ? (
                    <form onSubmit={handleSubmit(requestSignup)} className="mt-8">
                        <div className="space-y-4">
                            <Input
                                label="Username"
                                placeholder="Choose a username"
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: {
                                        value: 3,
                                        message: "Username must be at least 3 characters"
                                    }
                                })}
                            />
                            <Input
                                label="Full Name"
                                placeholder="Enter your full name"
                                {...register("name", {
                                    required: "Name is required",
                                })}
                            />
                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                    validate: {
                                        matchPattern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                            "Email address must be a valid address",
                                    }
                                })}
                            />
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
                                        {isSubmitting ? 'Sending OTP...' : 'Continue with Email'}
                                    </span>
                                </Button>
                            </motion.div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit(verifyAndComplete)} className="mt-8">
                        <div className="space-y-4">
                            <div className="text-center text-sm text-muted-foreground mb-4">
                                We've sent a verification code to<br />
                                <span className="font-medium text-foreground">{signupData?.email}</span>
                            </div>
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
                            <div className="text-sm text-muted-foreground">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("form");
                                        setError("");
                                        setSignupData(null);
                                    }}
                                    className="text-primary hover:underline"
                                >
                                    Change email
                                </button>
                                <span className="mx-2">•</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (signupData) {
                                            requestSignup({
                                                email: signupData.email,
                                                username: signupData.username,
                                                name: signupData.name
                                            });
                                        }
                                    }}
                                    className="text-primary hover:underline"
                                >
                                    Resend OTP
                                </button>
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
                                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
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

export default Signup