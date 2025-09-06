import React from 'react'
import { Link } from 'react-router-dom'
import { Feather } from 'lucide-react'

function Logo({ width = '100px', wrapper: Wrapper = Link }) {
  const content = (
    <>
      <Feather className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-base">
        BlogSpace
      </span>
    </>
  );

  // If Wrapper is false/null, return content without wrapper
  if (!Wrapper) {
    return <div className="flex items-center gap-2">{content}</div>;
  }

  // Otherwise wrap content with the specified component
  return (
    <Wrapper to="/" className="flex items-center gap-2">
      {content}
    </Wrapper>
  )
}

export default Logo