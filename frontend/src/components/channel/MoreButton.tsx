import { cn } from '@/lib/utils'
import type { ChannelInterface } from '@/types/youtube'
import { TbUserHeart } from 'react-icons/tb'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { AiOutlineGlobal } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import { IoEarthOutline } from 'react-icons/io5'
import { RiVideoLine } from 'react-icons/ri'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import { GrView } from 'react-icons/gr'

import { formatCompactNumber, formatViewCount, getCountryName } from '@/utils/youtube'
import { formatDescription } from '@/utils/description'
import ShareButton from '../ShareButton'

interface MoreButtonProps {
  className?: string
  channel: ChannelInterface
}

const MoreButton = ({ channel, className }: MoreButtonProps) => {
  const {
    id,
    snippet: { description, title, publishedAt, country },
    statistics: { subscriberCount, videoCount, viewCount }
  } = channel

  const navigate = useNavigate()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className='text-white font-medium cursor-pointer'>...more</p>
      </DialogTrigger>
      <DialogContent
        className={cn('bg-emerald-950 border-0 text-white p-0 pb-6', className)}
      >
        <DialogHeader className='pt-6 px-6'>
          <DialogTitle className='font-bold text-xl'>{title}</DialogTitle>
        </DialogHeader>
        <div className='h-[600px] overflow-y-auto'>
          <div className='px-6 space-y-4'>
            <p className='font-bold text-xl'>Description</p>
            <p className='text-sm'>{formatDescription(description)}</p>

            <p className='font-bold text-xl'>More info</p>

            <div className='flex items-center gap-4'>
              <AiOutlineGlobal className='text-2xl shrink-0' />
              <p
                onClick={() => navigate(`/channel/${id}`)}
                className='text-sm cursor-pointer truncate'
              >
                http://localhost:3000/channel/{id}
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <IoEarthOutline className='text-2xl shrink-0' />
              <p className='text-sm'>{getCountryName(country)}</p>
            </div>

            <div className='flex items-center gap-4'>
              <IoIosInformationCircleOutline className='text-2xl shrink-0' />
              <p className='text-sm'>
                Joined {new Date(publishedAt).toDateString()}
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <TbUserHeart className='text-2xl shrink-0' />
              <p className='text-sm'>
                {formatCompactNumber(+subscriberCount)} subscribers
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <RiVideoLine className='text-2xl shrink-0' />
              <p className='text-sm'>{formatViewCount(+videoCount)} videos</p>
            </div>

            <div className='flex items-center gap-4'>
              <GrView className='text-2xl shrink-0' />
              <p className='text-sm'>{formatViewCount(+viewCount)} views</p>
            </div>

            <div className='flex items-center gap-4'>
                <ShareButton contentId={id} type='channel' text='Share channel' buttonClassName='bg-neutral-700' />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MoreButton
