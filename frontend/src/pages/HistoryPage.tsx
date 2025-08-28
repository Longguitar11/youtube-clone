import { getHistory } from '@/api/youtube'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { YoutubeVideoInterface } from '@/types/youtube'
import { formatCompactNumber, timeAgo } from '@/utils/youtube'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const HistoryPage = () => {
  const navigate = useNavigate()

  const [videos, setVideos] = useState<YoutubeVideoInterface[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchHistory = async () => {
    setIsLoading(true)
    const { error, videos } = await getHistory()

    if (error) {
      toast.error(error)
    }

    if (videos && videos?.length > 0) {
      setVideos(videos)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  if (isLoading) return <LoadingSpinner />

  const renderedHistoryVideos = videos.map(video => {
    const {
      id,
      snippet: {
        publishedAt,
        title,
        channelId,
        thumbnails: {
          medium: { url }
        },
        channelTitle
      },
      statistics: { viewCount } = { viewCount: 0 }
    } = video

    return (
      <div
        key={id as string}
        onClick={() => navigate(`/watch/${id}`, { state: video })}
        className='cursor-pointer space-y-2 flex gap-4'
      >
        <img
          src={url}
          alt={title}
          loading='lazy'
          className='rounded-md w-60 shrink-0 object-cover'
        />

        <div className='flex gap-2'>
          <div className=''>
            <p className='text-white line-clamp-2 text-lg'>{title}</p>

            <div className=''>
              <p
                onClick={e => {
                  e.stopPropagation()
                  navigate(`/channel/${channelId}`)
                }}
                className='text-gray-400 text-sm hover:text-gray-100 transition-colors duration-200'
              >
                {channelTitle}
              </p>
              <p className='text-gray-400 text-sm'>
                {formatCompactNumber(viewCount)} views • {timeAgo(publishedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  })
  return (
    <div className='p-4 space-y-4'>
      <p className='text-3xl font-bold text-white'>Watch history</p>
      {renderedHistoryVideos}
    </div>
  )
}

export default HistoryPage
