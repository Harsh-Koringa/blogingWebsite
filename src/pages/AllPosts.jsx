import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";
import { motion } from 'framer-motion';
import { PostsGridSkeleton } from '../components/PostCardSkeleton';

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await appwriteService.getPosts([]);
                if (response && response.documents) {
                    setPosts(response.documents);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="w-full py-8">
                <Container>
                    <PostsGridSkeleton />
                </Container>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            <h1 className="text-2xl font-bold text-gray-500">
                                No posts found
                            </h1>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.$id}
                            className='p-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4'
                            initial={{ opacity: 0, y: 170 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1 // Creates staggered animation effect
                            }}
                            viewport={{ once: true }}
                        >
                            <PostCard {...post} />
                        </motion.div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default AllPosts