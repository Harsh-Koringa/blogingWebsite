import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import appwriteService from '../appwrite/config';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

function Comments({ postId }) {
    const commentsRef = useRef(null);
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const { setValue } = useForm();
    const [error, setError] = useState("");
    const userData = useSelector((state) => state.auth.userData);
    const { register, handleSubmit, reset } = useForm();

    const loadComments = async () => {
        try {
            const fetchedComments = await appwriteService.getComments(postId);
            setComments(fetchedComments);
        } catch (error) {
            console.error("Error loading comments:", error);
            setError("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (postId) {
            loadComments();
        }
    }, [postId]);

    const onSubmit = async (data) => {
        if (!userData.email) {
            setError("Please log in to comment");
            return;
        }

        try {
            await appwriteService.createComment(postId, userData.email, data.comment);
            reset(); // Clear form
            await loadComments(); // Reload comments
        } catch (error) {
            console.error("Error posting comment:", error);
            setError("Failed to post comment");
        }
    };

    useEffect(() => {
        // Check if we should scroll to comments
        if (location.state?.scrollToComments && commentsRef.current) {
            commentsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.state?.scrollToComments]);

    useEffect(() => {
        console.log("Profile component userData:", userData);
        if (userData?.profile) {
            // If we already have the profile in userData, use it
            console.log("Using existing profile from userData");
            setProfile(userData.profile);
            setValue("username", userData.profile.username);
            setValue("bio", userData.profile.bio || "");
            setLoading(false);
        } else if (userData?.user?.email) {
            console.log("Starting profile load with email:", userData.user.email);
            loadProfile();
        } else {
            console.log("No user data or email available");
            setLoading(false);
        }
    }, [userData, setValue]);

    return (
        <div ref={commentsRef} className="my-8 scroll-mt-16">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>

            {userData ? (
                <motion.form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex flex-col space-y-2">
                        <textarea
                            {...register("comment", {
                                required: "Comment cannot be empty",
                                minLength: {
                                    value: 3,
                                    message: "Comment must be at least 3 characters"
                                }
                            })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Write your comment..."
                            rows="3"
                        />
                        <button
                            type="submit"
                            className="self-end px-2 py-1 border border-primary text-primary 
             font-medium rounded-lg hover:bg-primary/10 
             focus:ring-2 focus:ring-primary/80 focus:outline-none 
             transition-colors"
                        >
                            Post Comment
                        </button>
                    </div>
                </motion.form>
            ) : (
                <p className="text-muted-foreground mb-6">Please log in to comment</p>
            )
            }

            {
                error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-destructive mb-4"
                    >
                        {error}
                    </motion.p>
                )
            }

            {
                loading ? (
                    <p>Loading comments...</p>
                ) : (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {comments.length === 0 ? (
                            <p className="text-muted-foreground">No comments yet</p>
                        ) : (
                            comments.map((comment) => (
                                <motion.div
                                    key={comment.$id}
                                    className="p-4 rounded-lg border"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium">{comment.username}</p>

                                        </div>
                                        {userData && userData.$id === comment.userId && (
                                            <button
                                                onClick={() => appwriteService.deleteComment(comment.$id).then(loadComments)}
                                                className="self-end px-2 py-1 border border-primary text-primary 
             font-medium rounded-lg bg-gray-500 shadow-sm
             hover:bg-primary/10 hover:shadow-md 
             active:translate-y-[1px] active:shadow-sm
             focus:ring-2 focus:ring-primary/80 focus:outline-none 
             transition-all duration-150"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-base">{comment.content}</p>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )
            }
        </div >
    );
}

export default Comments;
