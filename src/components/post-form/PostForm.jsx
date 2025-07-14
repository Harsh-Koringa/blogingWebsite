import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, Input, RTE, Select } from "../index";
import appwriteService from "../../appwrite/config";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        setLoading(true);
        if (post) {
            const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

            if (file) {
                await appwriteService.deleteFile(post.featuredImage);
            }

            const dbPost = await appwriteService.updatePost(post.$id, {
                ...data,
                featuredImage: file ? file.$id : post.featuredImage,
            });

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } else {
            const file = await appwriteService.uploadFile(data.image[0]);

            if (file) {
                const fileId = file.$id;
                data.featuredImage = fileId;
                const dbPost = await appwriteService.createPost({ ...data, userId: userData.$id });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                }
            }
        }
        setLoading(false);
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "")
                .replace(/--+/g, "-");
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
            onSubmit={handleSubmit(submit)}
        >
            <div className="space-y-8">
                <Input
                    label="Title"
                    placeholder="Enter title"
                    className="w-full"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug"
                    placeholder="Enter slug"
                    className="w-full"
                    {...register("slug", { required: true })}
                    readOnly
                />
                <Input
                    label="Featured Image"
                    type="file"
                    className="w-full"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="w-full aspect-video">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg object-cover w-full h-full"
                        />
                    </div>
                )}
                <RTE label="Content" name="content" control={control} defaultValue={getValues("content")} />
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="w-full"
                    {...register("status", { required: true })}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : post ? "Update" : "Submit"}
                </Button>
            </div>
        </motion.form>
    );
}

export default PostForm;