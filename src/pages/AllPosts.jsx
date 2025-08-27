import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";

function AllPosts() {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await appwriteService.getPosts([]);
            if (response && response.documents) {
                console.log("Setting posts:", response.documents); // Debug log
                setPosts(response.documents);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.$id} className='p-2 w-1/4'>
                            <div className='h-72 md:h-80 lg:h-96'> {/* Different heights for different screens */}
                                <PostCard
                                    {...post}
                                    slug={post.$id} // Explicitly pass the slug
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default AllPosts