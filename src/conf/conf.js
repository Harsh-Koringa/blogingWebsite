const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPRWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPRWRITE_DATABASE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPRWRITE_COLLECTION_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPRWRITE_BUCKET_ID),

}
export default conf