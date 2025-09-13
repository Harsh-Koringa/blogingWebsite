// conf/conf.js
console.log('Environment Variables:', {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    VITE_API_URL: import.meta.env.VITE_API_URL
});

// Use Vite's built-in flags instead of NODE_ENV
const isDevelopment = import.meta.env.DEV;  // ✅ This works reliably
const isProduction = import.meta.env.PROD;

const conf = {
    // Use DEV flag instead of NODE_ENV
    apiUrl: isDevelopment 
        ? import.meta.env.VITE_API_URL || 'http://localhost:5000'
        : '',
    
    appwriteUrl: "https://cloud.appwrite.io/v1",
    appwriteProjectId: "67ded1b9002fa28a53a6",
    appwriteDatabaseId: "67ded346002f37ba676e",
    appwriteCollectionId: "67ded38000000e23e2a6",
    appwriteBucketId: "67ded53e002927c9a53f",
    appwriteLikesCollection: "689f1c380003e034c85a",
    appwriteProfilesCollection: "profiles",
    appwriteCommentsCollection: "comments"
}

console.log("Environment Detection:", {
    isDevelopment,
    isProduction,
    mode: import.meta.env.MODE,
    apiUrl: conf.apiUrl
});

console.log("Loaded Config:", conf);

export default conf;
