import toast from 'react-hot-toast'
import { PiShareFatLight } from 'react-icons/pi'
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  LinkedinShareButton,
  PinterestShareButton,
  TwitterShareButton,
  ViberShareButton,
  WhatsappShareButton,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  PinterestIcon,
  ViberIcon
} from 'react-share'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Input } from './ui/input'
import IconButton from './IconButton'
import { cn } from '@/lib/utils'

interface ShareButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  contentId: string
  type?: 'video' | 'channel'
  text?: string
  textBtnClass?: string
  stopPropagation?: boolean
  isHiddenTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  buttonClassName?: string
}

const ShareButton = ({
  contentId,
  type = 'video',
  text,
  textBtnClass,
  isHiddenTrigger = false,
  open,
  onOpenChange,
  stopPropagation = false,
  className,
  buttonClassName,
  ...rest
}: ShareButtonProps) => {

  const url =
    type === 'video'
      ? `https://www.youtube.com/watch?v=${contentId}`
      : `https://www.youtube.com/channel/${contentId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch (err) {
      toast.error(`Failed to copy link to clipboard: ${String(err)}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild className={(cn(isHiddenTrigger && 'hidden'))}>
        <div
          onClick={e => stopPropagation && e.stopPropagation()}
          className='w-full'
        >
          <IconButton
            {...rest}
            text={text || 'Share'}
            textClassName={textBtnClass}
            className={buttonClassName}
          >
            <PiShareFatLight className='text-2xl' />
          </IconButton>
        </div>
      </DialogTrigger>

      <DialogContent
        onClick={e => e.stopPropagation()}
        className={cn(
          'sm:max-w-md bg-emerald-950 border-0 text-white',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className='text-center font-normal'>
            Share link
          </DialogTitle>
        </DialogHeader>

        <div className='flex items-center justify-center gap-3'>
          {/* Social share links */}
          <FacebookShareButton url={url}>
            <FacebookIcon size={36} round={true} />
          </FacebookShareButton>
          <FacebookMessengerShareButton appId='share-id' url={url}>
            <FacebookMessengerIcon size={36} round={true} />
          </FacebookMessengerShareButton>
          <WhatsappShareButton url={url}>
            <WhatsappIcon size={36} round={true} />
          </WhatsappShareButton>
          <TwitterShareButton url={url}>
            <TwitterIcon size={36} round={true} />
          </TwitterShareButton>
          <LinkedinShareButton url={url}>
            <LinkedinIcon size={36} round={true} />
          </LinkedinShareButton>
          <EmailShareButton url={url}>
            <EmailIcon size={36} round={true} />
          </EmailShareButton>
          <PinterestShareButton media={url} url={url}>
            <PinterestIcon size={36} round={true} />
          </PinterestShareButton>
          <ViberShareButton url={url}>
            <ViberIcon size={36} round={true} />
          </ViberShareButton>
        </div>

        {/* Copy link */}
        <div className='relative'>
          <Input
            type='text'
            readOnly
            value={url}
            className='w-full p-2 h-14 text-white rounded-md bg-gray-900 text-sm border-[0.5px]'
          />
          <button
            onClick={copyToClipboard}
            className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer bg-blue-500 hover:bg-blue-400 text-white text-sm py-2 px-4 rounded-full'
          >
            Copy
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareButton
