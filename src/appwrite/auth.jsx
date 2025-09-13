// authService.js
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
            throw error;
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

            // Check if user exists during login/signup
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

            const response = await fetch(`${this.baseUrl}/api/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, isSignup }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send OTP');
            }

            const data = await response.json();
            
            // Store the OTP token for verification
            if (data.otpToken) {
                localStorage.setItem('otpToken', data.otpToken);
                console.log('OTP token stored successfully');
            }

            return data;
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw error;
        }
    }

    // Verify OTP
    async verifyOTP(email, otp) {
        try {
            // Get the stored OTP token
            const otpToken = localStorage.getItem('otpToken');
            
            if (!otpToken) {
                throw new Error('No OTP token found. Please request a new OTP.');
            }

            const response = await fetch(`${this.baseUrl}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, otpToken }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to verify OTP');
            }

            const data = await response.json();
            
            if (data.token) {
                // Clear the OTP token after successful verification
                localStorage.removeItem('otpToken');
                
                // Store the auth token
                localStorage.setItem('auth_token', data.token);

                try {
                    // Get existing profile and update lastLogin
                    const { exists, profile } = await this.checkUserExists(email);
                    if (exists && profile) {
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
            // First check if already logged in
            const token = localStorage.getItem('auth_token');
            if (token) {
                throw new Error("Please logout before creating a new account");
            }

            // Send OTP first, with isSignup flag
            const result = await this.sendOTP(email, true);
            
            // Store signup data temporarily for completeSignup
            localStorage.setItem('signupData', JSON.stringify({ email, username, name }));
            
            return { email, username, name, ...result };
        } catch (error) {
            console.error("Error in createAccount:", error);
            throw error;
        }
    }

    // Complete account creation after OTP verification
    async completeSignup(email, username, name, otp) {
        try {
            console.log('Starting signup process for:', email);

            // Get the stored OTP token
            const otpToken = localStorage.getItem('otpToken');
            
            if (!otpToken) {
                throw new Error('No OTP token found. Please request a new OTP.');
            }

            const response = await fetch(`${this.baseUrl}/api/auth/complete-signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, name, otp, otpToken }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to complete signup');
            }

            const data = await response.json();
            console.log('Backend signup response:', data);

            if (data.token && data.user) {
                // Clear OTP token and signup data
                localStorage.removeItem('otpToken');
                localStorage.removeItem('signupData');

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

                    const documentId = ID.unique();
                    const profile = await this.databases.createDocument(
                        conf.appwriteDatabaseId,
                        conf.appwriteProfilesCollection,
                        documentId,
                        {
                            userId: documentId,
                            email: data.user.email,
                            username: data.user.username,
                            name: data.user.name,
                            createdAt: data.user.createdAt,
                            lastLogin: new Date().toISOString()
                        }
                    );
                    console.log('Successfully created Appwrite profile:', profile);
                } catch (error) {
                    console.error('Failed to create Appwrite profile:', error);
                    // Don't throw here - user is created successfully, profile can be created later
                }

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

            const response = await fetch(`${this.baseUrl}/api/user/profile`, {
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
            try {
                const { exists, profile } = await this.checkUserExists(userData.email);
                if (exists && profile) {
                    // Merge the profile data with user data
                    userData.profile = profile;
                }
            } catch (error) {
                console.error('Error getting user profile from Appwrite:', error);
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
            // Clear all tokens and data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('otpToken');
            localStorage.removeItem('signupData');

            // Call backend logout endpoint if it exists
            try {
                const token = localStorage.getItem('auth_token');
                await fetch(`${this.baseUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } catch (e) {
                console.log('Backend logout error (ignored):', e);
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
