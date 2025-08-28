import { cn } from '@/lib/utils'
import type { PostInterface } from '@/types/youtube'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '../../ui/carousel'
import { MdCheckCircle } from 'react-icons/md'
import { useEffect, useRef } from 'react'

interface PostRenderingProps {
  post: PostInterface
  isEdit: boolean
  editedText: string
  setEditedText: (text: string) => void
  className?: string
}

const PostRendering = ({
  post,
  isEdit,
  editedText,
  setEditedText,
  className
}: PostRenderingProps) => {
  const { text, images, quiz, type } = post

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (isEdit && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isEdit])

  return (
    <div className={cn('space-y-4 relative', className)}>
      {text && !isEdit && <p className='text-white'>{text}</p>}
      {isEdit && (
        <textarea
          ref={textareaRef}
          rows={4}
          className='w-full'
          value={editedText}
          onChange={e => setEditedText(e.target.value)}
        />
      )}

      {type === 'image' && images && images.length === 1 ? (
        <img
          src={images[0]}
          alt={text}
          className='w-auto lg:w-4/5 h-[300px] md:h-[500px] lg:h-[700px] object-contain rounded-2xl'
        />
      ) : type === 'image' && images && images.length > 1 && (
        <Carousel className='w-auto lg:w-4/5 text-black'>
          <CarouselContent>
            {images.map((url: string, index) => (
              <CarouselItem key={index}>
                <img
                  src={url}
                  alt={text}
                  className='w-full h-[200px] sm:h-[300px] md:h-[500px] lg:h-[700px] object-contain rounded-2xl'
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}

      {type === 'quiz' && quiz && quiz.length > 0 && (
        <div className='space-y-2 w-full'>
          {quiz.map(answer => (
            <div
              key={answer.id}
              className={cn(
                'w-full flex justify-between px-4 py-2 rounded-lg border border-neutral-700',
                answer.isCorrect && 'border-green-600'
              )}
            >
              <p className='text-lg'>{answer.value}</p>

              <div className='flex items-center gap-4'>
                <p>0%</p>
                {answer.isCorrect && (
                  <MdCheckCircle className='text-xl text-green-600' />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostRendering
