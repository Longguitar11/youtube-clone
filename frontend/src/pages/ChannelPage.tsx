import { MyChannel, MenuBar } from '@/components/channel'
import MoreButton from '@/components/channel/MoreButton'
import IconButton from '@/components/IconButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAppContext } from '@/context/useAppContext'
import { cn } from '@/lib/utils'
import type { MenuType } from '@/types/youtube'
import { formatCompactNumber } from '@/utils/youtube'
import { useEffect, useMemo } from 'react'
import { FaRegBell } from 'react-icons/fa6'
import { useParams } from 'react-router-dom'

const ChannelPage = () => {
  const { channelId, tab } = useParams()

  const {
    subscriptionIds,
    subscribe,
    fetchChannel,
    channel,
    isChannelLoading,
    user
  } = useAppContext()

  const isSubscribed = useMemo(() => {
    return subscriptionIds.includes(channelId!)
  }, [subscriptionIds, channelId])

  useEffect(() => {
    if (!user?.isGoogleSignin && channelId === user?.channel.channelId) return
    fetchChannel(channelId!)
  }, [channelId, user, fetchChannel])

  if (user?.channel.channelId === channelId)
    return <MyChannel />

  if (!channel) return null

  const {
    brandingSettings: {
      image: { bannerExternalUrl }
    },
    id,
    snippet: {
      title,
      thumbnails: {
        medium: { url }
      },
      customUrl,
      description
    },
    statistics: { subscriberCount, videoCount }
  } = channel

  if (isChannelLoading) return <LoadingSpinner />

  return (
    <div className='text-white mx-4 sm:mx-6 md:mx-10 space-y-4'>
      <img
        src={bannerExternalUrl}
        alt={title}
        className='w-full h-20 sm:h-24 md:h-36 lg:h-48 object-cover rounded-2xl'
      />

      <div className='flex gap-4 items-center'>
        <img
          src={url}
          alt={title}
          className='w-20 h-20 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 rounded-full'
        />

        <div className='space-y-1 sm:space-y-2 text-xs lg:text-sm'>
          <p className='font-bold text-2xl sm:text-4xl line-clamp-2'>
            {channel?.snippet.title}
          </p>
          <div className='flex flex-col sm:flex-row gap-1 sm:gap-2 sm:items-center whitespace-nowrap'>
            <p className='font-medium text-white'>{customUrl}</p>
            <div className='flex gap-2 items-center text-neutral-400'>
              <p>{formatCompactNumber(subscriberCount)} subscribers</p>
              <p>{formatCompactNumber(videoCount)} videos</p>
            </div>
          </div>

          <div className='hidden gap-2 items-center sm:flex'>
            <p className='text-clip whitespace-nowrap overflow-hidden text-neutral-400 w-72'>
              {description}
            </p>
            <MoreButton channel={channel} />
          </div>

          <IconButton
            onClick={() => subscribe(id)}
            text={isSubscribed ? 'Subscribed' : 'Subscribe'}
            className={cn(
              'sm:flex hidden w-fit',
              !isSubscribed && 'bg-white text-black hover:text-white'
            )}
          >
            {isSubscribed && <FaRegBell className='text-xl' />}
          </IconButton>
        </div>
      </div>

      <div className='flex gap-2 items-center text-xs text-neutral-400 sm:hidden'>
        <p className='text-clip whitespace-nowrap overflow-hidden w-72'>
          {description}
        </p>
        <MoreButton channel={channel} />
      </div>

      <button
        className={cn(
          'cursor-pointer text-sm p-2 rounded-full font-medium text-center w-full sm:hidden block',
          isSubscribed
            ? 'bg-green-950 hover:bg-green-900'
            : 'bg-white hover:bg-gray-200 text-black'
        )}
        onClick={() => subscribe(id)}
      >
        {isSubscribed ? 'Subscribed' : 'Subscribe'}
      </button>

      <MenuBar channelId={channelId!} tab={tab as MenuType} />
    </div>
  )
}

export default ChannelPage
