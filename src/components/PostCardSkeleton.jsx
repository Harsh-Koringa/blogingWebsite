import React from 'react';
import { motion } from 'framer-motion';

function PostCardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-[24px] glass-card h-full flex flex-col">
            {/* Image Skeleton */}
            <div className="relative rounded-t-[24px] overflow-hidden aspect-video bg-gray-200 dark:bg-gray-800">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                        x: ['-100%', '100%'],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            </div>

            {/* Content Skeleton */}
            <div className="p-6 flex-shrink-0 space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-3/4" />
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-5/6" />
                </div>

                {/* Actions Skeleton */}
                <div className="flex items-center gap-3 pt-2">
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full ml-auto" />
                </div>
            </div>
        </div>
    );
}

export function PostsGridSkeleton() {
    return (
        <div className="grid gap-6 auto-rows-[minmax(280px,auto)]"
            style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
        >
            {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                        height: [280, 400, 520][i % 3],
                        gridRow: `span ${Math.ceil([280, 400, 520][i % 3] / 280)}`
                    }}
                >
                    <PostCardSkeleton />
                </motion.div>
            ))}
        </div>
    );
}

export default PostCardSkeleton;
