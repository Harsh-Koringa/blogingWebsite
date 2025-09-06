import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import appwriteService from '../appwrite/config';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

function Comments({ postId }) {
    const commentsRef = useRef(null);
    const location = useLocation();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
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
        if (!userData) {
            setError("Please log in to comment");
            return;
        }

        try {
            await appwriteService.createComment(postId, userData.$id, data.comment);
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
                            className="self-end px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Post Comment
                        </button>
                    </div>
                </motion.form>
            ) : (
                <p className="text-muted-foreground mb-6">Please log in to comment</p>
            )}

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-destructive mb-4"
                >
                    {error}
                </motion.p>
            )}

            {loading ? (
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
                                            className="text-sm text-destructive hover:underline"
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
            )}
        </div>
    );
}

export default Comments;
