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

    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }


    // Add this helper function
    async slugExists(slug) {
        try {
            await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            return true; // Document exists
        } catch (error) {
            if (error.code === 404) {
                return false; // Document doesn't exist
            }
            throw error; // Other error
        }
    }

    // Your updated timestamp slug generator
    // async generateTimestampSlug(title) {
    //     const baseSlug = this.slugify(title);
    //     const timestamp = Math.floor(Date.now() / 1000);
    //     const slug = `${baseSlug}-${timestamp}`;

    //     // Extremely unlikely to collide, but safety check
    //     if (await this.slugExists(slug)) {
    //         return `${slug}-${Math.random().toString(36).substr(2, 4)}`;
    //     }

    //     return slug;
    // }


    async generateTimestampSlug(title) {
        // 1. Slugify and lowercase
        const base = this.slugify(title);         // e.g. "zanskar-trekking-through-himalayas"

        // 2. Use Unix-seconds timestamp (10 chars) for uniqueness
        const ts = Math.floor(Date.now() / 1_000); // e.g. 1757065515

        /* ──────────────────────────────────────────────
           UID limit = 36
           We need:  baseCut + "-" + ts   → baseCut + 11 chars
           So baseCut must be ≤25 chars.
        ────────────────────────────────────────────── */
        const maxBaseLen = 25;
        const baseCut = base.length > maxBaseLen ? base.slice(0, maxBaseLen) : base;

        let slug = `${baseCut}-${ts}`;            // length ≤36

        // 3. Rare collision check
        if (await this.slugExists(slug)) {
            // still keep ≤36 by replacing last 4 chars with random 4-char suffix
            const rand = Math.random().toString(36).slice(2, 6); // 4 safe chars
            slug = `${baseCut.slice(0, maxBaseLen - 5)}-${rand}`; // max 25-5 +1 +4 =25
        }

        return slug; // always 36 chars or fewer, Appwrite-safe
    }


    // Updated createPost method
    async createPost({ title, content, featuredImage, status, userId }) {
        try {
            // Generate unique slug from title
            const slug = await this.generateTimestampSlug(title);

            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug, // Use generated slug as document ID
                {
                    title,
                    content,
                    featuredImage,
                    status,
                    userId,
                    //createdAt: new Date().toISOString()
                }
            );
        } catch (error) {
            console.log("Service :: createPost :: error", error);
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
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
            if (response && response.documents) {
                console.log("Retrieved posts:", response.documents); // Debug log
                return response;
            }
            return null;
        } catch (error) {
            console.log("Service :: getPosts :: error", error);
            return null;
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

    // async likePost(postId, userId) {
    //     try {
    //         if (!postId || !userId) {
    //             console.log("Service :: likePost :: Missing required parameters");
    //             return false;
    //         }

    //         const data = {
    //             userId,
    //             postId,
    //             createdAt: new Date().toISOString()
    //         };

    //         // Generate a unique ID for the like
    //         const likeId = ID.unique();

    //         console.log("Creating like document:", { likeId, data });

    //         const result = await this.databases.createDocument(
    //             conf.appwriteDatabaseId,
    //             conf.appwriteLikesCollection,
    //             likeId,
    //             data
    //         );

    //         return result ? true : false;
    //     } catch (error) {
    //         console.log("Service :: likePost :: error", error);
    //         return false;
    //     }
    // }


    // async likePost(postId, userId) {
    //     try {
    //         if (!postId || !userId) {
    //             console.log("Service :: likePost :: Missing required parameters");
    //             return false;
    //         }

    //         // Use full IDs to ensure uniqueness
    //         const likeId = `${userId}_${postId}`;

    //         const data = {
    //             userId,
    //             postId,
    //             createdAt: new Date().toISOString()
    //         };

    //         const result = await this.databases.createDocument(
    //             conf.appwriteDatabaseId,
    //             conf.appwriteLikesCollection,
    //             likeId,
    //             data
    //         );

    //         return result ? true : false;
    //     } catch (error) {
    //         console.log("Service :: likePost :: error", error);
    //         return false;
    //     }
    // }

    // async unlikePost(postId, userId) {
    //     try {
    //         // Use same pattern as likePost
    //         const likeId = `${userId}_${postId}`;

    //         await this.databases.deleteDocument(
    //             conf.appwriteDatabaseId,
    //             conf.appwriteLikesCollection,
    //             likeId
    //         );
    //         return true;
    //     } catch (error) {
    //         console.log("Service :: unlikePost :: error", error);
    //         return false;
    //     }
    // }


    async likePost(postId, userId) {
        try {
            if (!postId || !userId) {
                console.log("Service :: likePost :: Missing required parameters");
                return false;
            }

            // Create shorter ID using first 8 chars of userId + last 8 chars of postId
            const shortUserId = userId.substring(0, 8);
            const shortPostId = postId.slice(-8);
            const likeId = `${shortUserId}_${shortPostId}`;

            const data = {
                userId,
                postId,
                createdAt: new Date().toISOString()
            };

            console.log("Creating like document:", { likeId, data });

            const result = await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollection,
                likeId,
                data
            );

            return result ? true : false;
        } catch (error) {
            console.log("Service :: likePost :: error", error);
            return false;
        }
    }

    async unlikePost(postId, userId) {
        try {
            if (!postId || !userId) {
                console.log("Service :: unlikePost :: Missing required parameters");
                return false;
            }

            // Use same pattern as likePost
            const shortUserId = userId.substring(0, 8);
            const shortPostId = postId.slice(-8);
            const likeId = `${shortUserId}_${shortPostId}`;

            console.log("Deleting like document:", { likeId });

            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollection,
                likeId
            );

            return true;
        } catch (error) {
            console.log("Service :: unlikePost :: error", error);
            return false;
        }
    }



    async getLikes(postId) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollection,
                [Query.equal('postId', postId)] // Using full postId for querying
            );
            return response.documents;
        } catch (error) {
            console.log("Service :: getLikes :: error", error);
            return [];
        }
    }

    async getUserLikes(userId) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteLikesCollection,
                [Query.equal('userId', userId)]
            );
            return response.documents;
        } catch (error) {
            console.log("Service :: getUserLikes :: error", error);
            return [];
        }
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
    // Profile Methods
    async createProfile(userId, username, bio = "") {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollection,
                userId,
                {
                    userId,
                    username,
                    bio,
                    //createdAt: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.log("Service :: createProfile :: error", error);
            throw error;
        }
    }

    async getProfile(userId) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollection,
                userId
            );
        } catch (error) {
            console.log("Service :: getProfile :: error", error);
            return null;
        }
    }

    async updateProfile(userId, { username, bio }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteProfilesCollection,
                userId,
                {
                    username,
                    bio,
                }
            );
        } catch (error) {
            console.log("Service :: updateProfile :: error", error);
            throw error;
        }
    }

    // Comment Methods
    async getCommentCount(postId) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollection,
                [Query.equal('postId', postId)]
            );
            return response.total;
        } catch (error) {
            console.log("Service :: getCommentCount :: error", error);
            return 0;
        }
    }

    async createComment(postId, userId, content) {
        try {
            const userProfile = await this.getProfile(userId);
            if (!userProfile) throw new Error("User profile not found");

            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollection,
                ID.unique(),
                {
                    postId,
                    userId,
                    content,
                    username: userProfile.username,
                    //createdAt: new Date().toISOString(),
                    //updatedAt: new Date().toISOString()
                }
            );
        } catch (error) {
            console.log("Service :: createComment :: error", error);
            throw error;
        }
    }

    async getComments(postId) {
        try {
            const response = await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollection,
                [
                    Query.equal("postId", postId),
                    /*Query.orderDesc("createdAt")*/
                ]
            );
            return response.documents;
        } catch (error) {
            console.log("Service :: getComments :: error", error);
            return [];
        }
    }

    async updateComment(commentId, content) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollection,
                commentId,
                {
                    content,
                    updatedAt: new Date().toISOString()
                }
            );
        } catch (error) {
            console.log("Service :: updateComment :: error", error);
            throw error;
        }
    }

    async deleteComment(commentId) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCommentsCollection,
                commentId
            );
            return true;
        } catch (error) {
            console.log("Service :: deleteComment :: error", error);
            return false;
        }
    }
};

const service = new Service();
export default service;