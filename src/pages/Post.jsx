import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    console.log("userData:", userData);
    console.log("post:", post);
    console.log("isAuthor:", isAuthor);




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

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex justify-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-center max-w-3xl">{post.title}</h1>
                </div>

                <div className="w-full flex justify-center mb-4 relative p-2">

                    <div className="max-w-4xl max-h-[500px] flex justify-center">
                        <img
                            src={appwriteService.getFileView(post.featuredImage)}
                            alt={post.title}
                            className="max-w-full max-h-[300px] object-contain rounded-xl"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.png';
                            }}
                        />
                    </div>

                    {isAuthor && (
                        <div className="absolute right-6 bottom-2">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button
                                    // bgColor="bg-transparent"
                                    bgColor="bg-white"
                                    className="hover:bg-gray-200 transition-colors duration-300 mr-3 border-2 border-black"
                                    textColor="text-black"
                                >
                                    Edit
                                </Button>

                            </Link>
                            <Button bgColor="bg-transparent" className="hover:bg-gray-200 transition-colors duration-300 mr-3 border-2 border-black" textColor="text-black" onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
                <div className="w-full flex justify-center mb-8">
                    <div className="browser-css prose prose-lg max-w-3xl mx-auto px-4 text-gray-800 
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-md prose-img:mx-auto
                  prose-hr:border-gray-300">
                        {parse(post.content)}
                    </div>
                </div>

            </Container>
        </div>
    ) : null;
}