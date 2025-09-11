import conf from '../conf/conf.js';
import { Client, Account, ID, Databases, Query } from "appwrite";

export class AuthService {
    client = new Client();
    account;
    databases;
    baseUrl = 'http://localhost:5000/api';

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
    }

    // Check if user exists
    async checkUserExists(email) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollection,
                [
                    // Using a Query to find user by email
                    // Note: You'll need to create an index on the email field in Appwrite
                    // to enable querying by email
                    //@ts-ignore
                    Query.equal('email', email)
                ]
            );
            return result.total > 0;
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    }

    // Send OTP for login or signup
    async sendOTP(email, isSignup = false) {
        try {
            // Only check if user exists during login
            if (!isSignup) {
                const userExists = await this.checkUserExists(email);
                if (!userExists) {
                    throw new Error("No account found with this email. Please sign up first.");
                }
            } else {
                // If signing up, check if user already exists
                const userExists = await this.checkUserExists(email);
                if (userExists) {
                    throw new Error("An account with this email already exists. Please log in instead.");
                }
            }

            const response = await fetch(`${this.baseUrl}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send OTP');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw error;
        }
    }

    // Verify OTP
    async verifyOTP(email, otp) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to verify OTP');
            }

            const data = await response.json();
            if (data.token) {
                localStorage.setItem('auth_token', data.token);

                // Store user data in profiles collection
                try {
                    await this.databases.createDocument(
                        conf.appwriteDatabaseId,
                        conf.appwriteProfilesCollection,
                        ID.unique(),
                        {
                            email,
                            username: email.split('@')[0], // default username from email
                            lastLogin: new Date().toISOString(),
                        }
                    );
                } catch (error) {
                    console.log('Profile already exists:', error);
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }

    // Create new account with OTP verification
    async createAccount(email, username, name) {
        try {
            // First check if email exists
            const token = localStorage.getItem('auth_token');
            if (token) {
                throw new Error("Please logout before creating a new account");
            }

            // Send OTP first, with isSignup flag
            await this.sendOTP(email, true);
            return { email, username, name };
        } catch (error) {
            console.error("Error in createAccount:", error);
            throw error;
        }
    }

    // Complete account creation after OTP verification
    async completeSignup(email, username, name, otp) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/complete-signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, name, otp }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to complete signup');
            }

            const data = await response.json();

            if (data.token && data.user) {
                // Store user data in profiles collection
                try {
                    await this.databases.createDocument(
                        conf.appwriteDatabaseId,
                        conf.appwriteProfilesCollection,
                        ID.unique(),
                        {
                            email: data.user.email,
                            username: data.user.username,
                            name: data.user.name,
                            createdAt: new Date().toISOString(),
                            lastLogin: new Date().toISOString(),
                        }
                    );
                } catch (error) {
                    console.log('Profile already exists:', error);
                }
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                    return data.user;
                }
                return null;
            } catch (error) {
                console.error("Error completing signup:", error);
                throw error;
            }
        }

    async getCurrentUser() {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return null;

                const response = await fetch(`${this.baseUrl}/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('auth_token');
                        return null;
                    }
                    throw new Error('Failed to get user profile');
                }

                return await response.json();
            } catch (error) {
                console.error('Error getting current user:', error);
                return null;
            }
        }

    async logout() {
            try {
                localStorage.removeItem('auth_token');
                return true;
            } catch (error) {
                console.error("Logout error:", error);
                throw error;
            }
        }
    }

    const authService = new AuthService();

export default authService;