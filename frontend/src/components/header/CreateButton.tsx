import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { HiOutlinePlus } from 'react-icons/hi2'
import { LiaEditSolid } from 'react-icons/lia'
import IconButton from '../IconButton'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '@/context/useAppContext'

interface CreateButtonProps {
  className?: string
  buttonClassName?: string
}

const CreateButton = ({ className, buttonClassName }: CreateButtonProps) => {
    const { user } = useAppContext()
    const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton className={buttonClassName} text='Create'>
          <HiOutlinePlus className='text-xl' />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'w-fit bg-neutral-800 text-white border-none p-0',
          className
        )}
        align='start'
      >
        <DropdownMenuGroup>
          <DropdownMenuItem className='p-0' asChild>
            <IconButton text='Create post' className='p-2 cursor-pointer' onClick={() => navigate(`/channel/${user?.channel.channelId}/posts`)}>
              <LiaEditSolid className='text-2xl' />
            </IconButton>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CreateButton
