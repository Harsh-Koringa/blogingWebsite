import React from 'react'
import appwriteService from "../appwrite/config"
import { Link } from 'react-router-dom'

function PostCard({ $id, title, featuredImage }) {

  return (
    <Link to={`/post/${$id}`}>
    <div className='w-full h-[320px] p-3 rounded-md flex flex-col bg-[#010101] hover:shadow-lg hover:shadow-gray-700 transition-all duration-300'>
        <div className='w-full aspect-[3/2] mb-4 overflow-hidden'>
          <img src={appwriteService.getFileView(featuredImage)} alt={title}
            className='w-full h-full object-cover rounded-md' />
        </div>
        <h2 className='text-xl text-white font-bold mt-3 line-clamp-2'>
        {title}
      </h2>
      </div>
    </Link>
  )
}

export default PostCard