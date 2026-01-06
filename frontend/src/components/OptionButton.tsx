import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { BiDotsHorizontalRounded, BiDotsVerticalRounded } from 'react-icons/bi'
import ShareButton from './ShareButton'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from './ui/dialog'
import { IoFlagOutline } from 'react-icons/io5'
import IconButton from './IconButton'
import { reportVideo } from '@/api/youtube'
import toast from 'react-hot-toast'
import type { ReportReasonInterface } from '@/types/youtube'
import { useAppContext } from '@/context/useAppContext'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { PiShareFatLight } from 'react-icons/pi'

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
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const { reportReasons } = useAppContext()
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [isReporting, setIsReporting] = useState(false)

  const closeRef = useRef<HTMLButtonElement>(null)

  const reportAVideo = async () => {
    setIsReporting(true)

    const { error, message } = await reportVideo({
      videoId,
      reasonId: selectedReason
    })

    if (error) {
      toast.error(error)
    }

    if (message) {
      toast.success(message)
      closeRef.current?.click()
    }

    setIsReporting(false)
  }

  return (
    <>
      <DropdownMenu modal={false}>
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
              <DropdownMenuItem
                className='p-0'
                onClick={e => {
                  e.stopPropagation()
                  setIsShareOpen(true)
                }}
              >
                <IconButton text={'Share'} className='rounded-none w-full'>
                  <PiShareFatLight className='text-2xl' />
                </IconButton>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className='p-0'
              onClick={e => {
                e.stopPropagation()
                setIsReportOpen(true)
              }}
            >
              <IconButton text='Report' className='rounded-none'>
                <IoFlagOutline className='text-2xl' />
              </IconButton>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareButton
        isHiddenTrigger={true}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        stopPropagation={true}
        contentId={videoId}
        buttonClassName='rounded-none w-full hover:text-white'
      />

      {/*  Report Button  */}
      <Dialog
        open={isReportOpen}
        onOpenChange={open => {
          setIsReportOpen(open)
          if (!open) setSelectedReason('')
        }}
      >
        <DialogContent
          onClick={e => e.stopPropagation()}
          className={cn(
            'sm:max-w-md bg-emerald-950 border-0 text-white',
            className
          )}
        >
          <DialogHeader>
            <DialogTitle className='text-center font-bold'>
              {type === 'home' ? 'Report image or title' : 'Report video'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {reportReasons ? (
              <RadioGroup
                value={selectedReason}
                onValueChange={setSelectedReason}
              >
                {reportReasons.map((reason: ReportReasonInterface) => (
                  <div key={reason.id} className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value={reason.id}
                      id={reason.id}
                      className={cn(reason.id === selectedReason && 'bg-white')}
                    />
                    <Label htmlFor={reason.id}>{reason.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p>...Loading</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='secondary'>Cancel</Button>
            </DialogClose>
            <Button
              type='submit'
              onClick={reportAVideo}
              disabled={selectedReason === '' || isReporting}
            >
              {isReporting ? 'Reporting...' : 'Report'}
            </Button>

            <DialogClose asChild>
              <Button ref={closeRef} className='hidden' />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default OptionButton
