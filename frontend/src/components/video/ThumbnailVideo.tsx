import { cn } from '@/lib/utils'
import type { YoutubeVideoInterface } from '@/types/youtube'
import { timeAgo } from '@/utils/youtube'
import { useNavigate } from 'react-router-dom'

interface ThumbnailVideoProps {
  video: YoutubeVideoInterface
  className?: string
}

const ThumbnailVideo = ({ video, className }: ThumbnailVideoProps) => {
  const navigate = useNavigate()

  if (!video) return null
  
  const {
    id,
    snippet: {
      publishedAt,
      title,
      thumbnails: {
        maxres: { url } = { url: '/banner-placeholder.png' }
      }
    }
  } = video

  return (
    <div
      key={id}
      className={cn('space-y-2 cursor-pointer', className)}
      onClick={() => navigate(`/watch/${id}`)}
    >
      <img
        src={url}
        alt={title}
        loading='lazy'
        className='object-cover w-full rounded-lg'
      />
      <p className='font-medium text-sm line-clamp-2'>{title}</p>
      <div>
        <p className='text-gray-400 text-xs truncate'>{timeAgo(publishedAt)}</p>
      </div>
    </div>
  )
}

export default ThumbnailVideo
