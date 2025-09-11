import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import appwriteService from "../appwrite/config";
import { Container, PostCard } from '../components'
import { motion } from 'framer-motion'
import { PostsGridSkeleton } from '../components/PostCardSkeleton'
import { Link } from 'react-router-dom'

function Home() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        if (authStatus) {
            appwriteService.getPosts().then((posts) => {
                if (posts) {
                    setPosts(posts.documents)
                }
            }).finally(() => {
                setLoading(false)
            })
        } else {
            setPosts([])
            setLoading(false)
        }
    }, [authStatus])

    if (loading) {
        return (
            <div className="w-full py-8">
                <Container>
                    <PostsGridSkeleton />
                </Container>
            </div>
        )
    }

    if (!authStatus) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
                                Please log in to read posts
                            </h1>
                            <Link
                                to="/login"
                                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    if (posts.length === 0 && authStatus) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">
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
                                delay: index * 0.1 // This creates the staggered effect
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

export default Home
