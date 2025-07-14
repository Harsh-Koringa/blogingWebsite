import React from 'react'

function Container({ children }) {
  return (
    <div className="mx-auto w-full px-4 sm:px-6">
      {children}
    </div>
  )
}

export default Container