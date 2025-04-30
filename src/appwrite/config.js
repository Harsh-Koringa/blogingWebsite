import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from "appwrite";

export class Service {

    client = new Client();
    databases;
    bucket;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId)
        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost({ title, slug, content, featuredImage, status, userId }) {
        try {
            return await this.databases.createDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug, {
                title,
                content,
                featuredImage,
                status,
                userId,
                //createdAt: Date.now()
            });
        } catch (error) {
            throw error;
        }
    }

    async updatePost(slug, { title, content, featuredImage, status }) {
        try {
            return await this.databases.updateDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug, {
                title,
                content,
                featuredImage,
                status,
                //updatedAt: Date.now()
            });
        } catch (error) {
            console.log("Service :: updatePost :: error", error);
        }
    }

    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug);
            return true;
        } catch (error) {
            console.log("Service :: deletePost :: error", error);
            return false;
        }

    }

    async getPost(slug) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug);
        } catch (error) {
            console.log("Service :: getPost :: error", error);
            return false;
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries,);
        } catch (error) {
            console.log("Service :: getPosts :: error", error);
            return false;
        }
    }

    async uploadFile(file) {
        try {
            return await this.bucket.createFile(conf.appwriteBucketId, ID.unique(), file);
        } catch (error) {
            console.log("Service :: uploadFile :: error", error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
            return true;
        } catch (error) {
            console.log("Service :: deleteFile :: error", error);
            return false;
        }
    }
    getFilePreview(fileId) {
        return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
    }

    getFileView(fileId) {
        return this.bucket.getFileView(conf.appwriteBucketId, fileId);
    }
    

    // getFilePreview(fileId) {
    //     if (!fileId) return '/placeholder.png';
        
    //     try {
    //       // For debugging - log the actual IDs being used
    //       console.log("Getting preview for:", conf.appwriteBucketId, fileId);
          
    //       // Explicitly set width and quality to ensure proper preview generation
    //       return this.bucket.getFilePreview(
    //         conf.appwriteBucketId,
    //         fileId,
    //         800, // width
    //         400, // height
    //         'center', // gravity
    //         85, // quality
    //         0, // border width
    //         '', // border color
    //         0, // border radius
    //         1, // opacity
    //         0, // rotation
    //         '', // background
    //         'jpg' // output format - try changing this
    //       );
    //     } catch (error) {
    //       console.error("Preview generation error:", error);
    //       return '/placeholder.png';
    //     }
    //   }
      
    
    
};

const service = new Service();
export default service;