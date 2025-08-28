import { cn } from '@/lib/utils'
import React from 'react'

interface IconButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  text?: string
  className?: string
  textClassName?: string
}

const IconButton = ({
  children,
  text,
  className,
  textClassName,
  ...rest
}: IconButtonProps) => {
  return (
    <div
      {...rest}
      className={cn(
        'flex text-white items-center gap-2 px-4 py-2 rounded-full bg-green-950 cursor-pointer hover:bg-emerald-900 transition-colors duration-200',
        className
      )}
    >
      {children}
      {text && <p className={cn('text-sm font-medium', textClassName)}>{text}</p>}
    </div>
  )
}

export default IconButton
