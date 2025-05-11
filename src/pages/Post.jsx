// Post.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

export default function Post() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const fromCard = location.state?.animation || false;

    const userData = useSelector((state) => state.auth.userData);
    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    const postVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.5
            }
        }
    };

    const childVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return post ? (
        <AnimatePresence>
            <motion.div 
                className="py-8"
                initial="hidden"
                animate="visible"
                variants={postVariants}
            >
                <Container>
                    <motion.div 
                        className="w-full flex justify-center mb-6"
                        variants={childVariants}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-center max-w-3xl">{post.title}</h1>
                    </motion.div>

                    <motion.div 
                        className="w-full flex justify-center mb-4 relative p-2"
                        variants={childVariants}
                    >
                        <div className="max-w-4xl max-h-[500px] flex justify-center">
                            <motion.img
                                src={appwriteService.getFileView(post.featuredImage)}
                                alt={post.title}
                                className="max-w-full max-h-[300px] object-contain rounded-xl"
                                initial={{ scale: fromCard ? 0.9 : 1, opacity: fromCard ? 0.8 : 1 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder.png';
                                }}
                            />
                        </div>

                        {isAuthor && (
                            <motion.div 
                                className="absolute right-6 bottom-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button
                                        bgColor="bg-white"
                                        className="hover:bg-gray-200 transition-colors duration-300 mr-3 border-2 border-black"
                                        textColor="text-black"
                                    >
                                        Edit
                                    </Button>
                                </Link>
                                <Button 
                                    bgColor="bg-transparent" 
                                    className="hover:bg-gray-200 transition-colors duration-300 mr-3 border-2 border-black" 
                                    textColor="text-black" 
                                    onClick={deletePost}
                                >
                                    Delete
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                    <motion.div 
                        className="w-full flex justify-center mb-8"
                        variants={childVariants}
                    >
                        <motion.div 
                            className="browser-css prose prose-lg max-w-3xl mx-auto px-4 text-gray-800 
                            prose-headings:text-gray-900 prose-headings:font-bold
                            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-md prose-img:mx-auto
                            prose-hr:border-gray-300"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            {parse(post.content)}
                        </motion.div>
                    </motion.div>
                </Container>
            </motion.div>
        </AnimatePresence>
    ) : null;
}
