import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'
import type { SidebarProps } from '@/types/sidebar'
import { sidebarItems } from '@/constants/sidebar'
import { useCallback, useEffect, useState } from 'react'
import { useAppContext } from '@/context/useAppContext'
import { getChannelsByIds } from '@/api/youtube'
import toast from 'react-hot-toast'
import type { ChannelInterface } from '@/types/youtube'
import LoadingSpinner from './LoadingSpinner'

const Sidebar = ({ sidebarStatus }: SidebarProps) => {
  const { pathname } = useLocation()
  const { subscriptionIds } = useAppContext()

  const [isSubscribedChannelsLoading, setIsSubscribedChannelsLoading] =
    useState(false)
  const [subscribedChannels, setSubscribedChannels] = useState<
    ChannelInterface[]
  >([])

  const fetchSubscribedChannels = useCallback(async () => {
    if (!subscriptionIds || subscriptionIds.length === 0) return

    setIsSubscribedChannelsLoading(true)

    const { channels, error } = await getChannelsByIds(subscriptionIds)

    if (error) {
      toast.error(error)
    }

    if (channels && (channels as ChannelInterface[]).length > 0) {
      setSubscribedChannels(channels as ChannelInterface[])
    }

    setIsSubscribedChannelsLoading(false)
  }, [subscriptionIds])

  useEffect(() => {
    fetchSubscribedChannels()
  }, [fetchSubscribedChannels])

  return (
    <div
      className={cn(
        'fixed top-14 left-0 h-[calc(100vh-56px)] overflow-y-auto bg-black text-gray-100 space-y-2',
        sidebarStatus === 'large'
          ? 'w-3xs p-4'
          : sidebarStatus === 'small'
          ? 'w-20 p-2'
          : 'hidden'
      )}
    >
      {sidebarItems.map((section, index) => (
        <div key={index} className='space-y-2 py-2 border-b border-gray-400/30'>
          {section.name && (
            <p
              className={cn(
                'text-lg font-medium ml-4',
                sidebarStatus === 'small' && 'hidden'
              )}
            >
              {section.name}
            </p>
          )}

          {section.items.map(item => (
            <Link
              to={item.to}
              key={item.name}
              className={cn(
                'flex items-center gap-4 py-2 px-4 hover:bg-gray-800 transition-colors duration-200 cursor-pointer rounded-md',
                sidebarStatus === 'large'
                  ? 'flex-row'
                  : sidebarStatus === 'small' && 'flex-col gap-2',
                pathname === item.to && 'bg-gray-800'
              )}
            >
              {item.icon}

              <span
                className={cn(
                  '',
                  sidebarStatus === 'large'
                    ? 'text-sm'
                    : sidebarStatus === 'small' && 'text-[10px]'
                )}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      ))}

      {isSubscribedChannelsLoading && <LoadingSpinner className='h-20' />}

      {sidebarStatus === 'large' && subscribedChannels?.length > 0 && (
        <div className={cn('space-y-2 h-[440px] overflow-y-auto', )}>
          <p className='text-lg font-medium ml-4'>Subscriptions</p>

          <div className=''>
            {subscribedChannels.map(channel => (
              <Link
                to={`/channel/${channel.id}`}
                key={channel.id}
                className='flex items-center gap-2 py-2 px-4 hover:bg-gray-800 transition-colors duration-200 cursor-pointer rounded-md'
              >
                <img
                  src={channel.snippet.thumbnails.medium.url}
                  alt={channel.snippet.title}
                  className='w-7 h-7 rounded-full'
                />

                <span className='text-sm truncate'>
                  {channel.snippet.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
