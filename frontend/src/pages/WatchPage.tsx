import { getVideoById } from '@/api/youtube'
import LoadingSpinner from '@/components/LoadingSpinner'
import VideoPlayer from '@/components/VideoPlayer'
import { useAppContext } from '@/context/useAppContext'
import type { YoutubeVideoInterface } from '@/types/youtube'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BiDislike, BiLike, BiSolidDislike } from 'react-icons/bi'
import { LiaDownloadSolid } from 'react-icons/lia'
import { FaRegBell } from 'react-icons/fa'
import { BiSolidLike } from 'react-icons/bi'
import { useNavigate, useParams } from 'react-router-dom'
import ShareButton from '@/components/ShareButton'
import IconButton from '@/components/IconButton'
import { cn } from '@/lib/utils'
import VideoDescription from '@/components/VideoDescription'
import { formatCompactNumber } from '@/utils/youtube'
import VideoComment from '@/components/VideoComment'
import OptionButton from '@/components/OptionButton'
import RelevantVideos from '@/components/video/RelevantVideos'

const WatchPage = () => {
  const {
    likedVideoIds,
    subscriptionIds,
    dislikedVideoIds,
    subscribe,
    ratingAVideo,
    fetchChannel,
    channel
  } = useAppContext()

  const { videoId } = useParams()
  const navigate = useNavigate()

  const [video, setVideo] = useState<YoutubeVideoInterface | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchVideoById = useCallback(async () => {
    setIsLoading(true)
    const { error, video } = await getVideoById(videoId || '')

    if (error) {
      toast.error(error)
    }

    if (video) {
      setVideo(video as YoutubeVideoInterface)
    }

    setIsLoading(false)
  }, [videoId])

  const isSubscribed = useMemo(
    () => subscriptionIds.includes(video?.snippet.channelId || ''),
    [subscriptionIds, video?.snippet.channelId]
  )

  const isLiked = useMemo(
    () => likedVideoIds.includes(videoId!),
    [likedVideoIds, videoId]
  )

  const isDisLiked = useMemo(
    () => dislikedVideoIds.includes(videoId!),
    [dislikedVideoIds, videoId]
  )

  useEffect(() => {
    fetchVideoById()
  }, [fetchVideoById])

  useEffect(() => {
    if (video?.snippet.channelId) {
      console.log('fetch channel')
      fetchChannel(video?.snippet.channelId)
    }
  }, [video?.snippet.channelId])

  if (!video) return null

  if (isLoading) return <LoadingSpinner />

  const {
    id,
    snippet: { title, channelId, channelTitle, description, publishedAt },
    statistics: { viewCount, likeCount, commentCount } = {
      viewCount: 0,
      likeCount: 0,
      commentCount: 0
    }
  } = video

  return (
    <div>
      {videoId && (
        <div>
          <VideoPlayer videoId={videoId || ''} />

          <div className='flex gap-4 px-4 lg:px-8 py-4 bg-black text-white overflow-hidden'>
            <div className='flex-1 space-y-4'>
              <p className='text-xl font-semibold line-clamp-2'>{title}</p>

              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0'>
                <div className='flex items-center gap-4'>
                  <div
                    className='flex items-center gap-2 cursor-pointer whitespace-nowrap'
                    onClick={() => navigate(`/channel/${channelId}`)}
                  >
                    <img
                      src={channel?.snippet.thumbnails.high.url || '/user.png'}
                      alt={channelTitle}
                      className='w-10 h-10 rounded-full'
                    />
                    <div>
                      <p className='font-medium truncate w-20 md:w-full'>
                        {channelTitle}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        {formatCompactNumber(
                          channel?.statistics.subscriberCount || 0
                        )}{' '}
                        subscribers
                      </p>
                    </div>
                  </div>

                  <IconButton
                    onClick={() => subscribe(channelId)}
                    text={isSubscribed ? 'Subscribed' : 'Subscribe'}
                    className={cn(
                      !isSubscribed && 'bg-white text-black hover:text-white'
                    )}
                  >
                    {isSubscribed && <FaRegBell className='text-xl' />}
                  </IconButton>
                </div>

                <div className='flex items-center gap-2'>
                  <div className='flex items-center rounded-full overflow-hidden bg-green-950 min-w-fit'>
                    <IconButton
                      text={formatCompactNumber(
                        isLiked ? +likeCount + 1 : likeCount
                      )}
                      onClick={() => ratingAVideo(videoId, 'like')}
                      className='rounded-none'
                    >
                      {isLiked ? (
                        <BiSolidLike className='text-xl' />
                      ) : (
                        <BiLike className='text-xl' />
                      )}
                    </IconButton>

                    <div className='w-[1px] h-4 bg-gray-600' />

                    <IconButton
                      onClick={() => ratingAVideo(videoId, 'dislike')}
                      className='rounded-none'
                    >
                      {isDisLiked ? (
                        <BiSolidDislike className='text-xl' />
                      ) : (
                        <BiDislike className='text-xl' />
                      )}
                    </IconButton>
                  </div>

                  <div className='flex gap-2 items-center'>
                    <ShareButton contentId={videoId} />

                    <IconButton
                      text='Download'
                      className='flex sm:hidden lg:flex'
                    >
                      <LiaDownloadSolid className='text-2xl' />
                    </IconButton>

                    <OptionButton
                      videoId={id}
                      type='watch'
                      buttonClassName='bg-green-950 hover:bg-emerald-900 size-10'
                    />
                  </div>
                </div>
              </div>

              <VideoDescription
                publishedAt={publishedAt}
                viewCount={viewCount}
                description={description}
              />

              <RelevantVideos
                className='block lg:hidden w-full'
                videoId={videoId}
                channelId={channelId}
              />

              <VideoComment
                className='w-full lg:flex-1'
                videoId={videoId}
                channelId={channelId}
                commentCount={commentCount}
              />
            </div>

            <RelevantVideos
              className='hidden lg:block lg:w-1/3'
              videoId={videoId}
              channelId={channelId}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default WatchPage
