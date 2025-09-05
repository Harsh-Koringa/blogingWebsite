// PostCard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, UserPlus } from 'lucide-react'
import appwriteService from "../appwrite/config"
import { useSelector } from 'react-redux'

function PostCard({ $id, slug, title, content, featuredImage, status, author }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [followed, setFollowed] = useState(false)
  const userData = useSelector((state) => state.auth.userData)

  // Debug log to check props
  useEffect(() => {
    console.log("PostCard props:", { $id, slug, title })
  }, [$id, slug, title]);

  useEffect(() => {
    // Load like count and user's like status when component mounts
    const loadLikes = async () => {
      if ($id) {
        const likes = await appwriteService.getLikes($id);
        setLikeCount(likes.length);

        if (userData?.$id) {
          // Check if current user has liked this post
          const hasLiked = likes.some(like => like.userId === userData.$id);
          setLiked(hasLiked);
        }
      }
    };

    const loadCommentCount = async () => {
      if ($id) {
        const count = await appwriteService.getCommentCount($id);
        setCommentCount(count);
      }
    };

    loadLikes();
    loadCommentCount();
  }, [$id, userData]);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!userData?.$id) {
      // Handle not logged in state - maybe show login prompt
      return;
    }

    try {
      if (!$id) {
        console.error('Missing post ID');
        return;
      }

      if (liked) {
        const result = await appwriteService.unlikePost($id, userData.$id);
        if (result) {
          setLikeCount(prev => prev - 1);
          setLiked(false);
        }
      } else {
        const result = await appwriteService.likePost($id, userData.$id);
        if (result) {
          setLikeCount(prev => prev + 1);
          setLiked(true);
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  return (
    <Link to={`/post/${$id}`}>
      <motion.article
        className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="aspect-video overflow-hidden dark:bg-gray-900"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={appwriteService.getFileView(featuredImage)}
            alt={title}
            className="h-full w-full object-cover transition-transform"
            loading="lazy"
          />
        </motion.div>

        <div className="p-3 flex-shrink-0 ">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight h-15 mb-2 ">
            {title}
          </h3>
          <div className="flex-1 mb-2"> {/* ⭐ Takes remaining space */}
            {content && (
              <p className="line-clamp-2 text-sm h-10 text-gray-600 dark:text-gray-800">
                {content.replace(/<[^>]+>/g, '')}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1 justify-start items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium transition-colors ${liked ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>Like {likeCount > 0 && `(${likeCount})`}</span>
            </motion.button>

            <Link to={`/post/${$id}#comments`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/post/${$id}#comments`;
                }}
                className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Comment {commentCount > 0 && `(${commentCount})`}</span>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                setFollowed(!followed)
              }}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium transition-colors
                ${followed
                  ? 'bg-brand-light/10 text-brand dark:bg-brand/20 dark:text-brand-light'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>{followed ? 'Following' : 'Follow'}</span>
            </motion.button>
          </div>

          {author && (
            <div className="mt-2 flex items-center gap-2 text-xs text-accent">
              <span>{author.name}</span>
              {status === "active" && (
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-1.5 text-xs font-medium text-green-700 dark:text-green-100">
                  Active
                </span>
              )}
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  )
}

export default PostCard
