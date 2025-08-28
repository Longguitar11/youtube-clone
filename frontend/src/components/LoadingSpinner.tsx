import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
}

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center h-[calc(100vh-56px)]', className)}>
      <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent'></div>
    </div>
  )
}

export default LoadingSpinner
