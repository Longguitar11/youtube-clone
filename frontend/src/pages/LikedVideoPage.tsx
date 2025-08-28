import { getMyLikedVideos } from '@/api/youtube'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { YoutubeVideoInterface } from '@/types/youtube'
import { formatCompactNumber, timeAgo } from '@/utils/youtube'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const LikedVideoPage = () => {
  const navigate = useNavigate()

  const [likedVideos, setLikedVideos] = useState<YoutubeVideoInterface[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchLikedVideos = async () => {
    setIsLoading(true)

    const { error, videos } = await getMyLikedVideos()

    if (error) {
      toast.error(error)
    }

    if (videos && (videos as YoutubeVideoInterface[]).length) {
      setLikedVideos(videos as YoutubeVideoInterface[])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchLikedVideos()
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!likedVideos.length) {
    return <div>No liked videos</div>
  }

  const renderedLikedVideos = likedVideos.map((video, index) => {
    const {
      id,
      snippet: {
        channelId,
        channelTitle,
        publishedAt,
        title,
        thumbnails: {
          medium: { url }
        }
      },
      statistics: { viewCount } = { viewCount: 0 }
    } = video

    return (
      <div
        onClick={() => navigate(`/watch/${id}`)}
        key={id as string}
        className='p-2 cursor-pointer flex gap-2 text-white rounded-md bg-neutral-950 hover:bg-neutral-800 transition-colors duration-200'
      >
        <div className='flex items-center gap-2'>
          <p>{index + 1}</p>
          <img
            src={url}
            alt={title}
            className='object-fit w-60 shrink-0 aspect-video rounded-xl'
          />
        </div>

        <div className='space-y-2'>
          <p className='font-medium line-clamp-2 text-lg'>{title}</p>
          <div className='flex gap-2 text-xs text-neutral-400'>
            <p
              className='hover:text-white transition-colors duration-200 cursor-pointer'
              onClick={e => {
                e.stopPropagation()
                navigate(`/channel/${channelId}`)
              }}
            >
              {channelTitle}
            </p>
            <p>{formatCompactNumber(viewCount)}</p>
            <p>{timeAgo(publishedAt)}</p>
          </div>
        </div>
      </div>
    )
  })

  return <div className='p-4 space-y-4'>
    <p className='text-3xl font-bold text-white'>Liked videos</p>
    {renderedLikedVideos}</div>
}

export default LikedVideoPage
