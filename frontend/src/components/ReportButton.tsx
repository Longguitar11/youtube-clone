import { cn } from '@/lib/utils'
import React, { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface ReportButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  videoId: string
  className?: string
  buttonClassName?: string
}

const ReportButton = ({
  videoId,
  className,
  buttonClassName,
  ...rest
}: ReportButtonProps) => {
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
    <Dialog>
      <DialogTrigger asChild>
        <IconButton {...rest} text='Report' className={buttonClassName}>
          <IoFlagOutline className='text-2xl' />
        </IconButton>
      </DialogTrigger>
      <DialogContent
        onClick={e => e.stopPropagation()}
        className={cn(
          'sm:max-w-md bg-emerald-950 border-0 text-white',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className='text-center font-bold'>
            Report image or title
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
                    className={cn(
                      reason.id === selectedReason &&
                        'border-blue-500 text-blue-500'
                    )}
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
  )
}

export default ReportButton
