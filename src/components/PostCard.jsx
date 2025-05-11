// PostCard.jsx
import React from 'react'
import appwriteService from "../appwrite/config"
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function PostCard({ $id, title, featuredImage }) {
  return (
    <Link to={`/post/${$id}`} state={{ animation: true }}>
      <motion.div 
        className='w-full h-auto sm:h-[320px] p-3 rounded-md flex flex-col bg-[#010101] hover:shadow-lg hover:shadow-gray-700 transition-all duration-300'
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <motion.div className='w-full aspect-[3/2] mb-4 overflow-hidden'>
          <motion.img 
            src={appwriteService.getFileView(featuredImage)} 
            alt={title}
            className='w-full h-full object-cover rounded-md'
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        <motion.h2 className='text-xl text-white font-bold mt-3 line-clamp-2'>
          {title}
        </motion.h2>
      </motion.div>
    </Link>
  )
}

export default PostCard
