import { getFeaturedChannelVideos, getVideosFromChannel } from '@/api/youtube'
import { cn } from '@/lib/utils'
import type { MenuType, YoutubeVideoInterface } from '@/types/youtube'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import ThumbnailVideo from '../video/ThumbnailVideo'
import { useAppContext } from '@/context/useAppContext'
import { Posts } from './posts'
import RenderCondition from '../RenderCondition'
import LoadingSpinner from '../LoadingSpinner'

const menuItems: MenuType[] = ['home', 'videos', 'posts']

interface ChannelVideoList {
  home: { videos: YoutubeVideoInterface[] }
  uploadedVideos: {
    videos: YoutubeVideoInterface[]
    nextPageToken: string | null
  }
}

interface MenuBarProps {
  channelId: string
  tab?: MenuType
}

const MenuBar = ({ channelId, tab = 'home' }: MenuBarProps) => {
  const { user } = useAppContext()

  const [menu, setMenu] = useState<MenuType>(tab)
  const [videoList, setVideoList] = useState<ChannelVideoList>({
    home: { videos: [] },
    uploadedVideos: { videos: [], nextPageToken: '' }
  })
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false)
  const [isVideosLoading, setIsVideosLoading] = useState(false)

  const observerTargetRef = useRef<HTMLDivElement | null>(null)
  const hasFetchedInitialVideos = useRef(false)

  const handleTabClick = (tab: MenuType) => {
    setMenu(tab)
  }

  const fetchFeaturedChannelVideos = useCallback(async () => {
    setIsFeaturedLoading(true)

    const { error, videos } = await getFeaturedChannelVideos(channelId)

    if (error) {
      toast.error(error)
    }

    if (videos && videos.length > 0) {
      setVideoList(pre => ({
        home: { videos },
        uploadedVideos: pre.uploadedVideos
      }))
    }

    setIsFeaturedLoading(false)
  }, [channelId])

  const fetchVideosFromChannel = useCallback(async () => {
    if (isVideosLoading || videoList.uploadedVideos.nextPageToken === null)
      return

    console.log('created fetchVideosFromChannel')

    setIsVideosLoading(true)

    const { error, result } = await getVideosFromChannel(
      channelId,
      videoList.uploadedVideos.nextPageToken || undefined
    )

    if (error) {
      toast.error(error)
    }

    if (result && result.items.length > 0) {
      setVideoList(pre => ({
        home: pre.home,
        uploadedVideos: {
          videos: [...pre.uploadedVideos.videos, ...result.items],
          nextPageToken: result.nextPageToken || null
        }
      }))
    }

    setIsVideosLoading(false)
  }, [channelId, videoList.uploadedVideos.nextPageToken, isVideosLoading])

  const isUserNoLoginWithGG = useMemo(() => {
    return !user?.isGoogleSignin && user?.channel.channelId === channelId
  }, [user, channelId])

  useEffect(() => {
    if (menu === 'home' && !isUserNoLoginWithGG) {
      fetchFeaturedChannelVideos()
    }

    if (
      menu === 'videos' &&
      !hasFetchedInitialVideos.current &&
      !isUserNoLoginWithGG
    ) {
      console.log('fetch videos from channel')
      fetchVideosFromChannel()
      hasFetchedInitialVideos.current = true
    }
  }, [
    fetchFeaturedChannelVideos,
    fetchVideosFromChannel,
    isUserNoLoginWithGG,
    menu
  ])

  useEffect(() => {
    if (
      !observerTargetRef.current ||
      !videoList.uploadedVideos.nextPageToken ||
      menu !== 'videos'
    ) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log('fetch when scrolling')
          fetchVideosFromChannel()
        }
      },
      {
        threshold: 0.1
      }
    )

    const target = observerTargetRef.current
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [fetchVideosFromChannel, menu, videoList.uploadedVideos.nextPageToken])

  useEffect(() => {
    // RESET THIS REF TO FETCH INITIAL VIDEOS
    hasFetchedInitialVideos.current = false
    setVideoList({
      home: { videos: [] },
      uploadedVideos: { videos: [], nextPageToken: '' }
    })
  }, [channelId])

  const renderedMenuItems = menuItems.map(item => {
    return (
      <div
        key={item}
        onClick={() => handleTabClick(item)}
        className={cn(
          'cursor-pointer border-b-[3px] border-transparent capitalize font-medium text-gray-400 hover:border-gray-400',
          menu === item && 'text-white border-white'
        )}
      >
        <div className={cn('py-2')}>{item}</div>
      </div>
    )
  })

  return (
    <div>
      <div className='flex px-10 gap-8 items-center border-b-[0.5px] border-gray-500/50'>
        {renderedMenuItems}
      </div>

      <RenderCondition condition={menu === 'home' && !isUserNoLoginWithGG}>
        {isFeaturedLoading ? (
          <LoadingSpinner className='h-60' />
        ) : videoList.home.videos.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 w-full'>
            {videoList.home.videos.map(video => {
              if (video.status?.privacyStatus === 'private') {
                return null
              }

              return <ThumbnailVideo key={video.id} video={video} />
            })}
          </div>
        ) : (
          <p className='text-white mt-4'>No featured videos for this channel</p>
        )}
      </RenderCondition>

      <RenderCondition condition={menu === 'videos' && !isUserNoLoginWithGG}>
        {isVideosLoading && videoList.uploadedVideos.videos.length === 0 ? (
          <LoadingSpinner className='h-60' />
        ) : videoList.uploadedVideos.videos.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 w-full'>
              {videoList.uploadedVideos.videos.map(video => (
                <ThumbnailVideo key={video.id} video={video} />
              ))}
            </div>
            {isVideosLoading && <LoadingSpinner className='h-30' />}
          </>
        ) : (
          <p className='text-white mt-4'>No videos for this channel</p>
        )}
      </RenderCondition>

      {menu === 'posts'
        ? user?.channel.channelId === channelId && <Posts />
        : null}

      <div ref={observerTargetRef} className='h-4' />
    </div>
  )
}

export default MenuBar
