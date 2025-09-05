const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
    appwriteLikesCollection: String(import.meta.env.VITE_APPWRITE_LIKES_COLLECTION_ID),
    appwriteProfilesCollection: String(import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID),
    appwriteCommentsCollection: String(import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID)
}

console.log("Loaded Appwrite Config:", conf);

export default conf