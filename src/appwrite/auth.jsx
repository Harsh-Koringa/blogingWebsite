import conf from '../conf/conf.js';
import { Client, Account, ID, Databases, Query } from "appwrite";

export class AuthService {
    client = new Client();
    account;
    databases;
    baseUrl = conf.apiUrl;

    constructor() {
        console.log('Initializing AuthService with config:', {
            appwriteUrl: conf.appwriteUrl,
            projectId: conf.appwriteProjectId,
            databaseId: conf.appwriteDatabaseId,
            profilesCollection: conf.appwriteProfilesCollection
        });

        // Initialize the client
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
    }

    // Check if user exists and return profile if found
    async checkUserExists(email) {
        try {
            console.log('Checking user with config:', {
                databaseId: conf.appwriteDatabaseId,
                profilesCollection: conf.appwriteProfilesCollection,
                email: email
            });

            if (!conf.appwriteDatabaseId || !conf.appwriteProfilesCollection) {
                throw new Error('Database or collection ID is missing');
            }

            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollection,
                [
                    // Using a Query to find user by email
                    Query.equal('email', email)
                ]
            );
            console.log('Query result:', result);

            if (result.total > 0) {
                return { exists: true, profile: result.documents[0] };
            }
            return { exists: false, profile: null };
        } catch (error) {
            console.error('Error checking user existence:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                config: {
                    appwriteUrl: conf.appwriteUrl,
                    databaseId: conf.appwriteDatabaseId,
                    profilesCollection: conf.appwriteProfilesCollection
                }
            });
            throw error; // Re-throw to handle in sendOTP
        }
    }

    // Send OTP for login or signup
    async sendOTP(email, isSignup = false) {
        try {
            console.log('Sending OTP with config:', {
                baseUrl: this.baseUrl,
                isSignup: isSignup,
                email: email
            });

            // Only check if user exists during login
            try {
                const { exists } = await this.checkUserExists(email);
                console.log('User exists check result:', exists);

                if (!isSignup && !exists) {
                    throw new Error("No account found with this email. Please sign up first.");
                } else if (isSignup && exists) {
                    throw new Error("An account with this email already exists. Please log in instead.");
                }
            } catch (error) {
                if (error.message === 'Database or collection ID is missing') {
                    throw error;
                }
                // If there's an error checking user existence, log it but continue for signup
                if (isSignup) {
                    console.warn('Error checking user existence during signup:', error);
                } else {
                    throw error;
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

                try {
                    // Get existing profile
                    const { exists, profile } = await this.checkUserExists(email);
                    if (exists && profile) {
                        // Update lastLogin time
                        await this.databases.updateDocument(
                            conf.appwriteDatabaseId,
                            conf.appwriteProfilesCollection,
                            profile.$id,
                            {
                                lastLogin: new Date().toISOString()
                            }
                        );
                        console.log('Updated login time for existing profile:', profile.userId);
                    }
                } catch (error) {
                    console.error('Error updating login time:', error);
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
            console.log('Starting signup process for:', email);

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
            console.log('Backend signup response:', data);

            if (data.token && data.user) {
                console.log('Creating Appwrite profile with config:', {
                    databaseId: conf.appwriteDatabaseId,
                    collectionId: conf.appwriteProfilesCollection,
                });

                // Store user data in profiles collection
                try {
                    console.log('Creating profile with data:', {
                        email: data.user.email,
                        username: data.user.username,
                        name: data.user.name
                    });

                    const documentId = ID.unique(); // Generate ID first
                    const profile = await this.databases.createDocument(
                        conf.appwriteDatabaseId,
                        conf.appwriteProfilesCollection,
                        documentId,
                        {
                            userId: documentId, // Use the same ID as the document ID
                            email: data.user.email,
                            username: data.user.username,
                            name: data.user.name,
                        }
                    );
                    console.log('Successfully created Appwrite profile:', profile);
                } catch (error) {
                    console.error('Failed to create Appwrite profile:', error);
                    // Don't just log the error, throw it to handle it properly
                    throw error;
                }
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

            const userData = await response.json();

            // Get the Appwrite profile
            const { exists, profile } = await this.checkUserExists(userData.user.email);
            if (exists && profile) {
                // Merge the profile data with user data
                userData.profile = profile;
            }

            console.log('Current user data with profile:', userData);
            return userData;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async logout() {
        try {
            // Clear token
            localStorage.removeItem('auth_token');

            // Clear any session data if needed
            // You might want to add any other cleanup here

            // Call backend logout endpoint if needed
            try {
                await fetch(`${this.baseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
            } catch (e) {
                console.log('Backend logout error:', e);
                // Continue even if backend logout fails
            }

            return true;
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    }
}

const authService = new AuthService();

export default authService;