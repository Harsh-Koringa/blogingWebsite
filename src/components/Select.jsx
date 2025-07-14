import React, { useId } from 'react'
import { cn } from '../lib/utils'

const Select = React.forwardRef(function Select(
  {
    options = [],
    label,
    className = '',
    error,
    ...props
  },
  ref
) {
  const id = useId()

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={cn(
          `
            flex h-10 w-full rounded-md border border-input bg-background
            px-3 py-2 text-sm ring-offset-background
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
          `,
          className
        )}
        {...props}
      >
        {options?.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-background"
          >
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select