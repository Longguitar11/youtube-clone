import { cn } from '@/lib/utils'
import { formatDescription } from '@/utils/description'
import { formatViewCount, timeAgo } from '@/utils/youtube'
import { useState } from 'react'

interface VideoDescriptionProps {
  viewCount: number
  publishedAt: Date
  description?: string
}

const VideoDescription = ({
  publishedAt,
  viewCount,
  description
}: VideoDescriptionProps) => {
  const [isShowFull, setIsShowFull] = useState(false)

  return (
    <div className='rounded-md bg-emerald-950 p-4 text-sm space-y-2 text-white'>
      <div className='font-medium flex items-center gap-2'>
        <p className=''>{formatViewCount(+viewCount)} views</p>
        <p>{timeAgo(publishedAt)}</p>
      </div>

      {description ? (
        <div
          className={cn(
            'flex justify-between',
            isShowFull ? 'flex-col gap-4' : 'items-end'
          )}
        >
          <p
            className={cn(
              'font-normal line-clamp-4',
              isShowFull && 'line-clamp-none'
            )}
          >
            {formatDescription(description)}{' '}
          </p>

          <p
            onClick={() => setIsShowFull(pre => !pre)}
            className='font-medium cursor-pointer whitespace-nowrap'
          >
            {isShowFull ? 'Show less' : 'Show more'}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default VideoDescription


