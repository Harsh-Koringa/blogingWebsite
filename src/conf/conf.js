// Log raw environment variables for debugging
console.log('Environment Variables:', {
    VITE_APPWRITE_URL: import.meta.env.VITE_APPWRITE_URL,
    VITE_APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    // Don't log sensitive values in production
    HAS_DATABASE_ID: !!import.meta.env.VITE_APPWRITE_DATABASE_ID,
    HAS_COLLECTION_ID: !!import.meta.env.VITE_APPWRITE_COLLECTION_ID
});

const conf = {
    apiUrl: "http://localhost:5000/api",
    appwriteUrl: "https://cloud.appwrite.io/v1",
    appwriteProjectId: "67ded1b9002fa28a53a6",
    appwriteDatabaseId: "67ded346002f37ba676e",
    appwriteCollectionId: "67ded38000000e23e2a6",
    appwriteBucketId: "67ded53e002927c9a53f",
    appwriteLikesCollection: "689f1c380003e034c85a",
    appwriteProfilesCollection: "profiles",
    appwriteCommentsCollection: "comments"
}

console.log("Loaded Appwrite Config:", conf);

export default conf