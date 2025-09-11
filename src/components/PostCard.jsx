// PostCard.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react'
import appwriteService from "../appwrite/config"
import { useSelector } from 'react-redux'

function PostCard({ $id, slug, title, content, featuredImage, status, author, category = "General" }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const userData = useSelector((state) => state.auth.userData)

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!userData?.$id) {
      navigate('/login', {
        state: {
          message: 'Please log in to bookmark posts',
          returnTo: `/post/${$id}`
        }
      });
      return;
    }
    setBookmarked(!bookmarked);
    // TODO: Implement bookmark functionality with Appwrite
  }

  // Debug log to check props
  useEffect(() => {
    console.log("PostCard props:", { $id, slug, title })
  }, [$id, slug, title]);

  const [userProfile, setUserProfile] = useState(null);

  // Effect to load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (userData?.user?.email) {
        try {
          const profile = await appwriteService.getProfile(userData.user.email);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };
    loadUserProfile();
  }, [userData?.user?.email]);

  // Effect to load likes and comments
  useEffect(() => {
    const loadLikes = async () => {
      if ($id) {
        try {
          const likes = await appwriteService.getLikes($id);
          setLikeCount(likes.length);

          if (userProfile) {
            const hasLiked = likes.some(like => like.userId === userProfile.$id);
            setLiked(hasLiked);
          }
        } catch (error) {
          console.error('Error loading likes:', error);
        }
      }
    };

    const loadCommentCount = async () => {
      if ($id) {
        try {
          const count = await appwriteService.getCommentCount($id);
          setCommentCount(count);
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      }
    };

    loadLikes();
    loadCommentCount();
  }, [$id, userProfile]);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!userData?.user?.email) {
      // Redirect to login page
      navigate('/login', {
        state: {
          message: 'Please log in to like posts',
          returnTo: `/post/${$id}`
        }
      });
      return;
    }

    try {
      if (!$id) {
        console.error('Missing post ID');
        return;
      }

      if (!userProfile) {
        console.error('User profile not found');
        return;
      }

      // Optimistically update UI
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);

      const result = liked
        ? await appwriteService.unlikePost($id, userData.user.email)
        : await appwriteService.likePost($id, userData.user.email);

      if (!result) {
        // Revert if operation failed
        setLiked(liked);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  return (
    <Link to={`/post/${$id}`}>
      <motion.article
        className="group relative overflow-hidden rounded-[24px] glass-card h-full flex flex-col"
        whileHover={{
          y: -16,
          scale: 1.02,
          transition: { duration: 0.4, ease: "easeOut" }
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Category Badge */}
        {/*<motion.span
          className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-medium gradient-bg-primary text-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {category}
        </motion.span>*/}

        {/* Bookmark Button */}
        {/*<motion.button
          className="absolute top-4 right-4 z-10 p-2 glass-card rounded-full theme-transition"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBookmark}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current text-primary' : ''}`} />
        </motion.button>*/}

        {/* Image Container */}
        <div className="relative rounded-t-[24px] overflow-hidden aspect-video">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-[1]" />

          <motion.img
            src={appwriteService.getFileView(featuredImage)}
            alt={title}
            className="h-full w-full object-cover transition-transform"
            loading="lazy"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Author Avatar */}
          {author && (
            <motion.div
              className="absolute bottom-4 left-4 z-10 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="h-12 w-12 rounded-full border-2 border-white overflow-hidden">
                <img
                  src={author.avatar || 'https://ui-avatars.com/api/?name=' + author.name}
                  alt={author.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-white">
                <p className="text-sm font-medium">{author.name}</p>
                {status === "active" && (
                  <span className="text-xs text-emerald-400">Active</span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 flex-shrink-0">
          <h4 className="h-15 overflow-hidden line-clamp-2 text-xl font-semibold tracking-tight mb-3">
            {title}
          </h4>
          <div className="h-15 overflow-hidden">
            {content && (
              <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                {content.replace(/<[^>]+>/g, '')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${liked
                  ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50'
                  : 'glass-card hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${liked
                    ? 'fill-red-500 text-red-500'
                    : 'text-primary'
                  }`}
              />
              <span className={`${liked ? 'text-red-600 dark:text-red-400' : ''
                }`}>
                {likeCount > 0 ? likeCount : 'Like'}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                navigate(`/post/${$id}`, { state: { scrollToComments: true } })
              }}
              className="glass-card flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                navigator.share({
                  title,
                  text: content.replace(/<[^>]+>/g, '').substring(0, 100),
                  url: window.location.origin + `/post/${$id}`
                }).catch(console.error)
              }}
              className="glass-card flex items-center gap-2 p-2 rounded-full ml-auto"
            >
              <Share2 className="h-4 w-4 text-primary" />
            </motion.button>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

export default PostCard
