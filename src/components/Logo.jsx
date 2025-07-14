import React from 'react'
import { Link } from 'react-router-dom'
import { Feather } from 'lucide-react'

function Logo({ width = '100px' }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <Feather className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-base">
        BlogSpace
      </span>
    </Link>
  )
}

export default Logo