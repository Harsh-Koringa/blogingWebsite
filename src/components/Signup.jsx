import React, { useState } from 'react'
import authService from '../appwrite/auth'
import appwriteService from '../appwrite/config'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store/authSlice'
import { Button, Input, Logo } from './index.js'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const { register, handleSubmit } = useForm()

    const create = async (data) => {
        setError("");

        // Validate password
        if (data.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        // Validate username
        if (data.username.length < 3) {
            setError("Username must be at least 3 characters long");
            return;
        }

        try {
            // First try to create the account
            const userData = await authService.createAccount(data.email, data.password, data.name);

            if (userData) {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    try {
                        // Then create the profile
                        await appwriteService.createProfile(
                            currentUser.$id,
                            data.username || data.name
                        );
                        dispatch(login({ userData: currentUser }));
                        navigate("/");
                    } catch (profileError) {
                        console.error("Error creating profile:", profileError);
                        setError("Error creating user profile. Please try again.");
                        // Clean up by logging out if profile creation fails
                        await authService.logout();
                    }
                }
            }
        } catch (error) {
            console.error("Signup error:", error);
            // Handle specific error messages
            if (error.message.includes("email already exists")) {
                setError("This email is already registered. Please try logging in instead.");
            } else if (error.message.includes("logout before creating")) {
                setError("You are already logged in. Please log out first.");
            } else {
                setError(error.message || "Failed to create account. Please try again.");
            }
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

                <form onSubmit={handleSubmit(create)} className="mt-8">
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
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />
                        <Button type="submit" className="w-full">
                            Create Account
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default Signup