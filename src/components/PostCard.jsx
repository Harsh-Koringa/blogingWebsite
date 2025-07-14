// PostCard.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, UserPlus } from 'lucide-react'
import appwriteService from "../appwrite/config"

function PostCard({ $id, title, content, featuredImage, status, author }) {
  const [liked, setLiked] = useState(false)
  const [followed, setFollowed] = useState(false)

  return (
    <Link to={`/post/${$id}`}>
      <motion.article
        className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
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

        <div className="p-5">
          <h3 className="line-clamp-2 text-xl font-semibold tracking-tight ">
            {title}
          </h3>
          {content && (
            <p className="mt-2 line-clamp-2 text-gray-600 dark:text-gray-800">
              {content.replace(/<[^>]+>/g, '')}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-1 justify-start items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                setLiked(!liked)
              }}
              className={`flex items-center gap-1.5 rounded-full px-1 py-1.5 text-sm font-medium transition-colors
                ${liked
                  ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>Like</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 rounded-full px-1 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault()
                setFollowed(!followed)
              }}
              className={`flex items-center gap-1.5 rounded-full px-1 py-1.5 text-sm font-medium transition-colors
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
            <div className="mt-4 flex items-center gap-2 text-sm text-accent">
              <span>{author.name}</span>
              {status === "active" && (
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-100">
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
