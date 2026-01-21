import { cn } from '@/lib/utils'
import { type FormEvent } from 'react'
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
  text,
  className,
  type = 'comment'
}: CommentInputProps) => {
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
        value={text}
        onChange={e => setText(e.target.value)}
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
          <Button type='submit'>Save</Button>
        ) : (
          <Button type='submit'>Comment</Button>
        )}
      </div>
    </form>
  )
}

export default CommentInput
