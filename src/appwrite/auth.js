import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);

    }

    async createAccount(email, password, name) {
        try {
            // First check if email exists
            try {
                await this.account.get();
                // If we get here, user is already logged in
                throw new Error("Please logout before creating a new account");
            } catch (err) {
                // Expected error if no session exists
                if (err.code !== 401) {
                    throw err;
                }
            }

            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if (userAccount) {
                return this.login(email, password);
            } else {
                return userAccount;
            }
        } catch (error) {
            console.error("Error in createAccount:", error);
            if (error?.code === 409) {
                throw new Error("An account with this email already exists. Please try logging in instead.");
            }
            throw error;
        }

    }

    async login(email, password) {
        try {
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite service :: getCurrentUser :: error", error);
        }
        return null;
    }

    async logout() {
        try {
            return await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite service :: logout :: error", error);
        }


    }
}

const authService = new AuthService();

export default authService;