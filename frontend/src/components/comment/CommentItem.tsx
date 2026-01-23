import { useAppContext } from '@/context/useAppContext'
import { cn } from '@/lib/utils'
import type { CommentInterface, CommentThreadInterface } from '@/types/youtube'
import { formatCompactNumber, timeAgo } from '@/utils/youtube'
import { BiDislike, BiLike, BiSolidDislike, BiSolidLike } from 'react-icons/bi'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { Button } from '../ui/button'
import { editComment, replyComment } from '@/api/youtube'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import CommentInput from './CommentInput'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'

interface CommentItemProps {
  comment: CommentInterface
  className?: string
  type?: 'reply' | 'normal'
  setCommentThreads: React.Dispatch<
    React.SetStateAction<CommentThreadInterface[]>
  >
}

const CommentItem = ({
  comment,
  className,
  type = 'normal',
  setCommentThreads
}: CommentItemProps) => {
  const {
    id,
    snippet: {
      videoId,
      authorDisplayName,
      authorProfileImageUrl,
      authorChannelId: { value: authorChannelId },
      textOriginal,
      likeCount,
      parentId,
      publishedAt
    }
  } = comment

  const [text, setText] = useState('')
  const [isReply, setIsReply] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editText, setEditText] = useState(textOriginal)

  const { dislikedCommentIds, likedCommentIds, ratingAComment, user } =
    useAppContext()

  const handleReply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!text || !videoId || !authorChannelId) return

    const { comment, error } = await replyComment({
      text,
      videoId,
      authorChannelId,
      parentId: type === 'reply' ? parentId! : id
    })

    console.log(comment)

    if (error) {
      toast.error(error)
    }

    if (comment) {
      setCommentThreads(pre =>
        pre.map(commentThread => {
          if (commentThread.id === comment.snippet.parentId) {
            return {
              ...commentThread,
              snippet: {
                ...commentThread.snippet,
                totalReplyCount: commentThread.snippet.totalReplyCount + 1
              },
              replies: {
                comments: [comment, ...(commentThread.replies?.comments || [])]
              }
            }
          }
          return commentThread
        })
      )

      setText('')
      toast.success('Reply a comment successfully')
    }

    setIsReply(false)
  }

  const handleEditComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editText || !videoId || editText === textOriginal) return

    const { message, error } = await editComment({
      commentId: id,
      text,
      videoId,
      parentId
    })

    if (error) {
      toast.error(error)
    }

    if (message) {
      // setCommentThreads(pre =>
      //   pre.map(commentThread => {
      //     if (commentThread.id === id) {
      //       return {
      //         ...commentThread,
      //         snippet: {
      //           ...commentThread.snippet,
      //           textOriginal: text,
      //         }
      //       }
      //     }
      //     return commentThread
      //   })
      // )
      setEditText('')
      toast.success(message)
    }

    setIsEdit(false)
  }

  return (
    <div className={cn('flex gap-4', className)}>
      <img
        src={authorProfileImageUrl || '/user.png'}
        alt={authorDisplayName}
        loading='lazy'
        className={cn('rounded-full', type === 'normal' ? 'size-10' : 'size-6')}
      />

      <div className='flex flex-1 justify-between items-start gap-4'>
        <div className='space-y-1 w-full'>
          <div className='flex items-center gap-1'>
            <p className='font-medium text-sm'>{authorDisplayName}</p>
            <p className='text-xs text-neutral-300'>{timeAgo(publishedAt)}</p>
          </div>

          {isEdit ? (
            <CommentInput
              text={editText}
              onSubmit={handleEditComment}
              setText={setEditText}
              type='edit'
            />
          ) : (
            <p className='font-normal text-sm line-clamp-2'>{textOriginal}</p>
          )}

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div
                className='flex items-center gap-1 cursor-pointer'
                onClick={() => ratingAComment(id, 'like')}
              >
                {likedCommentIds.includes(id) ? (
                  <div className='rounded-full p-1 hover:bg-neutral-500/50 transition-colors duration-200'>
                    <BiSolidLike className='text-xl' />
                  </div>
                ) : (
                  <div className='rounded-full p-1 hover:bg-neutral-500/50 transition-colors duration-200'>
                    <BiLike className='text-xl' />
                  </div>
                )}
                <p className='text-xs text-neutral-300'>
                  {formatCompactNumber(
                    likedCommentIds.includes(id) ? likeCount + 1 : likeCount
                  )}
                </p>
              </div>

              <div
                onClick={() => ratingAComment(id, 'dislike')}
                className='cursor-pointer'
              >
                {dislikedCommentIds.includes(id) ? (
                  <div className='rounded-full p-1 hover:bg-neutral-500/50 transition-colors duration-200'>
                    <BiSolidDislike className='text-xl' />
                  </div>
                ) : (
                  <div className='rounded-full p-1 hover:bg-neutral-500/50 transition-colors duration-200'>
                    <BiDislike className='text-xl' />
                  </div>
                )}
              </div>

              <Button
                onClick={() => setIsReply(prev => !prev)}
                className='text-xs rounded-full bg-black hover:bg-neutral-500/50 transition-colors duration-200'
              >
                Reply
              </Button>
            </div>
          </div>

          {isReply && (
            <CommentInput
              onSubmit={handleReply}
              setText={setText}
              text={text}
              type='reply'
            />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='p-2 rounded-full hover:bg-neutral-700 transition-colors duration-200'>

            <HiOutlineDotsVertical
              className={cn('text-lg cursor-pointer', isEdit && 'hidden')}
              />
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-green-950 text-white'>
            {user?.channel.channelId === authorChannelId ? (
              <DropdownMenuItem onClick={() => setIsEdit(true)}>
                Edit
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem>Report</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default CommentItem
