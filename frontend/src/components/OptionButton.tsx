import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { BiDotsHorizontalRounded, BiDotsVerticalRounded } from 'react-icons/bi'
import ReportButton from './ReportButton'
import ShareButton from './ShareButton'
import { cn } from '@/lib/utils'

interface OptionButtonProps {
  videoId: string
  type?: 'home' | 'watch'
  className?: string
  buttonClassName?: string
}

const OptionButton = ({
  videoId,
  type = 'home',
  className,
  buttonClassName
}: OptionButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          onClick={e => e.stopPropagation()}
          className={cn(
            'cursor-pointer shrink-0 size-8 flex items-center justify-center rounded-full hover:bg-neutral-500/50 transition-colors duration-200',
            buttonClassName
          )}
        >
          {type === 'watch' ? (
            <BiDotsHorizontalRounded className='text-xl' />
          ) : (
            <BiDotsVerticalRounded className='text-xl' />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'w-fit bg-neutral-800 text-white border-none p-0',
          className
        )}
        align='start'
      >
        <DropdownMenuGroup>
          {type === 'home' && (
            <DropdownMenuItem className='p-0'>
              <ShareButton
                onClick={e => e.stopPropagation()}
                contentId={videoId}
                buttonClassName='rounded-none w-full hover:text-white'
              />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className='p-0'>
            <ReportButton
              buttonClassName='rounded-none w-full hover:text-white'
              onClick={e => e.stopPropagation()}
              videoId={videoId}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default OptionButton
