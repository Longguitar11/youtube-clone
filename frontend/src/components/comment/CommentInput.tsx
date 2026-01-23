import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface CommentInputProps {
  className?: string
  text: string
  type?: 'comment' | 'reply' | 'edit'
  setText: (text: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const CommentInput = ({
  onSubmit,
  setText,
  text = '',
  className,
  type = 'comment'
}: CommentInputProps) => {
  const [commentText, setCommentText] = useState(text)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      if (text !== commentText) {
        setText(commentText)
      }
    }, 800)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [commentText])

  // Update commentText when text changes externally
  useEffect(() => {
    setCommentText(text)
  }, [text])

  return (
    <form
      onSubmit={onSubmit}
      className={cn('flex items-center gap-4', className)}
    >
      <img
        src='/user.png'
        alt='my avatar'
        loading='lazy'
        className={cn('size-10 rounded-full', type === 'edit' && 'hidden')}
      />
      <Input
        placeholder='Add a comment...'
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
        className='flex-1'
        autoFocus={type === 'reply'}
      />

      <div className='flex gap-2 items-center'>
        {/* {type !== 'comment' && (
          <Button
            variant='outline'
            className='text-black'
            onClick={() => setText('')}
          >
            Cancel
          </Button>
        )} */}

        {type === 'edit' ? (
          <Button type='submit'>
            Save
          </Button>
        ) : (
          <Button type='submit' disabled={!commentText}>
            Comment
          </Button>
        )}
      </div>
    </form>
  )
}

export default CommentInput
