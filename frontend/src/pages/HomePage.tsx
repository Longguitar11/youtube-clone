import type { ChannelInterface } from '@/types/youtube'
import { useEffect, useMemo, useState } from 'react'
import { formatCompactNumber, timeAgo } from '@/utils/youtube'
import { getChannelsByIds } from '@/api/youtube'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '@/context/useAppContext'
import { cn } from '@/lib/utils'
import OptionButton from '@/components/OptionButton'
import LoadingSpinner from '@/components/LoadingSpinner'

const MAX_CHANNELS_PER_REQUEST = 50

function chunkArray<T> (arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

const HomePage = () => {
  const navigate = useNavigate()
  const { videos, isVideoLoading, observerTargetRef, searchTerm, fetchVideos } =
    useAppContext()

  const [channelAvatars, setChannelAvatars] = useState<Record<string, string>>(
    {}
  )

  const fetchedChannelIds = useMemo(
    () => new Set(Object.keys(channelAvatars)),
    [channelAvatars]
  )

  const channelIds = useMemo(() => {
    const channelIds = videos.map(video => video.snippet.channelId)
    return [...new Set(channelIds)]
  }, [videos])

  const fetchChannelAvatars = async () => {
    const idsToFetch = channelIds.filter(id => !fetchedChannelIds.has(id))
    if (idsToFetch.length === 0) return

    const chunks = chunkArray(idsToFetch, MAX_CHANNELS_PER_REQUEST)
    const newAvatars: Record<string, string> = {}

    for (const chunk of chunks) {
      try {
        const { channels, error } = await getChannelsByIds(chunk)
        if (error) {
          toast.error(error)
          continue
        }
        if (channels && (channels as ChannelInterface[]).length) {
          ;(channels as ChannelInterface[]).forEach(channel => {
            newAvatars[channel.id] = channel.snippet.thumbnails.default.url
          })
        }
      } catch (err) {
        console.error('Failed fetching channel avatars:', err)
      }
    }

    setChannelAvatars(prev => ({ ...prev, ...newAvatars }))
  }

  useEffect(() => {
    if (channelIds.length > 0) {
      fetchChannelAvatars()
    }
  }, [channelIds])

  useEffect(() => {
    if (!searchTerm && videos.length === 0) {
      fetchVideos()
    }
  }, [])

  const renderedVideos = videos.map(video => {
    const {
      id,
      snippet: { publishedAt, title, channelId, thumbnails, channelTitle },
      statistics: { viewCount } = { viewCount: 0 }
    } = video

    return (
      <div
        key={id}
        onClickCapture={(e) => {
          const dialogContent = document.querySelector(
            '[data-slot="dialog-content"]'
          )
      
          // Allow clicks INSIDE dialog
          if (
            dialogContent &&
            dialogContent.contains(e.target as Node)
          ) {
            return
          }
      
          // Block navigation if dialog exists
          if (dialogContent) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        onClick={() => {
          navigate(`/watch/${id}`)
        }}
        className='cursor-pointer space-y-2'
      >
        <img
          src={thumbnails.maxres?.url || thumbnails.medium?.url}
          alt={title}
          loading='lazy'
          className='rounded-lg w-full object-contain'
        />

        <div className='flex gap-2'>
          <img
            src={channelAvatars[channelId] || '/user.png'}
            alt={title}
            loading='lazy'
            className='w-9 h-9 rounded-full shrink-0'
          />

          <div className='flex-1 flex justify-between gap-2 text-white'>
            <div className=''>
              <p className='line-clamp-2'>{title}</p>
              <p
                onClick={e => {
                  e.stopPropagation()
                  navigate(`/channel/${channelId}`)
                }}
                className='text-gray-400 text-sm truncate hover:text-gray-100 transition-colors duration-200'
              >
                {channelTitle}
              </p>
              <p className='text-gray-400 text-sm truncate'>
                {formatCompactNumber(viewCount)} views • {timeAgo(publishedAt)}
              </p>
            </div>

            <OptionButton videoId={id} />
          </div>
        </div>
      </div>
    )
  })

  return (
    <div className='p-4'>
      {isVideoLoading && videos.length === 0 ? (
        <LoadingSpinner />
      ) : videos.length > 0 ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {renderedVideos}
          </div>
          {isVideoLoading && <LoadingSpinner className='h-30' />}
        </>
      ) : (
        <p className='text-white'>No videos found</p>
      )}

      <div ref={observerTargetRef} className={cn('h-4')} />
    </div>
  )
}

export default HomePage
