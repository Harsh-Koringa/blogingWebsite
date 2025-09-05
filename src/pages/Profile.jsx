import React, { useEffect, useState } from 'react';
import { Container } from '../components';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import appwriteService from '../appwrite/config';
import { motion } from 'framer-motion';
import { Input } from '../components';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const userData = useSelector((state) => state.auth.userData);
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (userData) {
            loadProfile();
        }
    }, [userData]);

    const loadProfile = async () => {
        try {
            const userProfile = await appwriteService.getProfile(userData.$id);
            setProfile(userProfile);
            // Pre-fill form data
            setValue("username", userProfile.username);
            setValue("bio", userProfile.bio || "");
        } catch (error) {
            console.error("Error loading profile:", error);
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await appwriteService.updateProfile(userData.$id, {
                username: data.username,
                bio: data.bio
            });
            setIsEditing(false);
            loadProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Failed to update profile");
        }
    };

    if (!userData) {
        return (
            <Container>
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                    <p className="text-xl text-gray-500">Please log in to view your profile</p>
                </div>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container>
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                    <p className="text-xl">Loading profile...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="max-w-2xl mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl p-6 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Profile</h1>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-destructive mb-4"
                        >
                            {error}
                        </motion.p>
                    )}

                    {isEditing ? (
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <Input
                                label="Username"
                                placeholder="Enter username"
                                {...register("username", {
                                    required: "Username is required",
                                    minLength: {
                                        value: 3,
                                        message: "Username must be at least 3 characters"
                                    }
                                })}
                            />
                            <div>
                                <label className="block text-sm font-medium mb-1">Bio</label>
                                <textarea
                                    {...register("bio")}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Tell us about yourself..."
                                    rows="4"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Save Changes
                            </button>
                        </motion.form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-sm font-medium text-muted-foreground">Email</h2>
                                <p className="text-lg">{userData.email}</p>
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-muted-foreground">Username</h2>
                                <p className="text-lg">{profile?.username}</p>
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-muted-foreground">Bio</h2>
                                <p className="text-lg">{profile?.bio || "No bio yet"}</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </Container>
    );
}

export default Profile;
