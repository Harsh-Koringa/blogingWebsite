import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { RTE, Select } from "../index";
import appwriteService from "../../appwrite/config";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import FloatingInput from "../ui/FloatingInput";
import ImageUpload from "../ui/ImageUpload";
import GradientButton from "../ui/GradientButton";
import { useToast, ToastContainer } from "../ui/Toast";
import useDebounce from "../../hooks/useDebounce";

function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues, formState: { errors } } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const { addToast, toasts, removeToast } = useToast();

    // Autosave functionality
    const handleAutoSave = async (data) => {
        if (!post || !post.$id) return; // Only autosave existing posts

        try {
            await appwriteService.updatePost(post.$id, {
                ...data,
                featuredImage: post.featuredImage,
            });
            setLastSaved(new Date());
            addToast({ message: "Draft saved", type: "success" });
        } catch (error) {
            console.error("Autosave failed:", error);
            addToast({ message: "Failed to save draft", type: "error" });
        }
    };

    const autoSave = useDebounce(handleAutoSave, 2000);

    const submit = async (data) => {
        if (!post && (!data.image)) {
            addToast({ message: "Featured image is required", type: "error" });
            return;
        }

        setLoading(true);
        try {
            if (post) {
                const file = data.image ? await appwriteService.uploadFile(data.image) : null;

                if (file) {
                    await appwriteService.deleteFile(post.featuredImage);
                }

                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: file ? file.$id : post.featuredImage,
                });

                if (dbPost) {
                    setSuccess(true);
                    addToast({ message: "Post updated successfully", type: "success" });
                    setTimeout(() => {
                        navigate(`/post/${dbPost.$id}`);
                    }, 1000);
                }
            } else {
                const file = await appwriteService.uploadFile(data.image);

                if (file) {
                    const fileId = file.$id;
                    data.featuredImage = fileId;
                    const dbPost = await appwriteService.createPost({ ...data, userId: userData.$id });

                    if (dbPost) {
                        setSuccess(true);
                        addToast({ message: "Post created successfully", type: "success" });
                        setTimeout(() => {
                            navigate(`/post/${dbPost.$id}`);
                        }, 1000);
                    }
                }
            }
        } catch (error) {
            console.error("Error submitting post:", error);
            addToast({ message: "Failed to save post", type: "error" });
        } finally {
            setLoading(false);
        }
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
        <>
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative space-y-8 rounded-xl border border-border bg-card/50 p-4 md:p-8 backdrop-blur-xl"
                onSubmit={handleSubmit(submit)}
                style={{
                    // Prevent iOS zoom on input focus
                    fontSize: '16px'
                }}
            >



                <div className="space-y-8">
                    <FloatingInput
                        label="Title"
                        {...register("title", {
                            required: "Title is required"
                        })}
                        error={errors.title?.message}
                    />

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                            URL Slug
                        </label>
                        <input
                            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                            {...register("slug", {
                                required: "Slug is required"
                            })}
                            readOnly
                        />
                        {errors.slug?.message && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-destructive"
                            >
                                {errors.slug.message}
                            </motion.p>
                        )}
                    </div>

                    <ImageUpload
                        value={watch('image')}
                        onChange={(file) => setValue('image', file)}
                        error={errors.image?.message}
                    />

                    <motion.div
                        className="rounded-lg border border-border overflow-hidden transition-all"
                        animate={{
                            scale: previewMode ? 0.98 : 1,
                            opacity: previewMode ? 0.7 : 1,
                        }}
                    >
                        <RTE
                            label="Content"
                            name="content"
                            control={control}
                            defaultValue={getValues("content")}
                        />
                    </motion.div>

                    <Select
                        options={["active", "inactive"]}
                        label="Status"
                        className="w-full"
                        {...register("status", {
                            required: "Status is required"
                        })}
                        error={errors.status?.message}
                    />

                    <div className="flex justify-center">
                        <GradientButton
                            type="submit"
                            className="w-30"
                            loading={loading}
                            success={success}
                        >
                            {post ? "Update Post" : "Create Post"}
                        </GradientButton>
                    </div>

                    {lastSaved && (
                        <p className="text-center text-sm text-muted-foreground">
                            Last saved: {new Date(lastSaved).toLocaleTimeString()}
                        </p>
                    )}
                </div>
            </motion.form>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </>
    );
}

export default PostForm;