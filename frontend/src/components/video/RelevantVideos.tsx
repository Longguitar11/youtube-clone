import { getRelevantVideos } from '@/api/youtube'
import type { YoutubeVideoInterface } from '@/types/youtube'
import { formatCompactNumber, timeAgo } from '@/utils/youtube'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../LoadingSpinner'
import { cn } from '@/lib/utils'
import OptionButton from '../OptionButton'
import { Skeleton } from '../ui/skeleton'

interface RelevantVideosProps {
  videoId: string
  channelId: string
  className?: string
}

const RelevantVideos = ({
  videoId,
  channelId,
  className
}: RelevantVideosProps) => {
  const navigate = useNavigate()

  const [relevantVideos, setRelevantVideos] = useState<YoutubeVideoInterface[]>(
    []
  )
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isFirstFetch = useRef(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchRelevantVideos = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)

    const { error, result } = await getRelevantVideos({
      videoId,
      channelId,
      nextPageToken: nextPageToken || undefined
    })

    if (error) {
      // toast.error(error)
      setIsLoading(false)
      return
    }

    if (result && result.items.length) {
      setRelevantVideos(prev => {
        const newResults = result.items.filter(
          newVideo => !prev.some(v => v.id === newVideo.id)
        )

        if (newResults.length === 0) return prev
        return [...prev, ...newResults]
      })
      setNextPageToken(result.nextPageToken || null)
    }

    setIsLoading(false)
  }, [videoId, channelId, nextPageToken, isLoading])

  useEffect(() => {
    if (!isFirstFetch.current) {
      console.log('first fetch relevant videos')
      fetchRelevantVideos()
      isFirstFetch.current = true
    }
  }, [fetchRelevantVideos])

  useEffect(() => {
    if (!observerRef.current || !nextPageToken) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log('fetching more relevant videos')
          fetchRelevantVideos()
        }
      },
      { threshold: 0.5 }
    )

    const target = observerRef.current

    if (target) observer.observe(observerRef.current)

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [fetchRelevantVideos, nextPageToken])

  useEffect(() => {
    console.log('reset relevant videos')
    setRelevantVideos([])
    setNextPageToken(null)
    isFirstFetch.current = false
  }, [videoId])

  const renderedRelevantVideos = relevantVideos.map(video => {
    const {
      id,
      snippet: { title, channelTitle, publishedAt, thumbnails, channelId },
      statistics: { viewCount } = { viewCount: 0 }
    } = video

    return (
      <div
        key={id}
        className='flex flex-col xl:flex-row gap-3 cursor-pointer w-full'
        onClick={() => {
          navigate(`/watch/${id}`)
        }}
      >
        <img
          src={thumbnails.medium.url}
          alt={title}
          className='w-full xl:w-40 xl:h-24 object-cover rounded-lg'
        />
        <div className='flex flex-1 justify-between gap-2 min-w-0'>
          <div className='space-y-1 flex-1 min-w-0'>
            <p className='text-white text-sm font-medium truncate'>{title}</p>
            <p
              className='text-gray-400 text-xs hover:text-gray-100 transition-colors duration-200 truncate'
              onClick={e => {
                e.stopPropagation()
                navigate(`/channel/${channelId}`)
              }}
            >
              {channelTitle}
            </p>
            <p className='text-xs text-gray-400 truncate'>
              {formatCompactNumber(Number(viewCount))} views •{' '}
              {timeAgo(publishedAt)}
            </p>
          </div>

          <OptionButton videoId={id} type='home' />
        </div>
      </div>
    )
  })

  return (
    <div className={cn(className)}>
      {isLoading && relevantVideos.length === 0 ? (
        <div className='w-full xl:space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xl:block'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='flex flex-col xl:flex-row gap-4'>
              <Skeleton className='w-full h-40 xl:w-40 xl:h-24 rounded-lg' />

              <div className='flex-1 space-y-1'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
              </div>
            </div>
          ))}
        </div>
      ) : relevantVideos.length > 0 ? (
        <>
          <div className='w-full xl:space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xl:block'>
            {renderedRelevantVideos}
          </div>
          {isLoading && <LoadingSpinner className='h-30' />}
        </>
      ) : (
        <p className='text-white'>No relevant videos found</p>
      )}

      <div ref={observerRef} className='h-4 hidden xl:block' />

      {nextPageToken && !isLoading && relevantVideos.length > 0 && (
        <button
          onClick={fetchRelevantVideos}
          className='text-sm font-medium text-blue-400 cursor-pointer rounded-full border border-neutral-500/50 w-full py-2 mt-4 hover:bg-blue-500/40 transition-colors duration-200 inline-block xl:hidden'
        >
          Show more
        </button>
      )}
    </div>
  )
}

export default RelevantVideos
