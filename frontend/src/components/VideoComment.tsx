import { cn } from '@/lib/utils'
import type { CommentThreadInterface } from '@/types/youtube'
import { BsFilterLeft } from 'react-icons/bs'
import { useCallback, useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import {
  commentTopLevel,
  getRepliedOtherComments,
  getVideoComments
} from '@/api/youtube'
import toast from 'react-hot-toast'
import { formatCompactNumber, formatViewCount } from '@/utils/youtube'
import { GoChevronDown, GoChevronUp } from 'react-icons/go'
import CommentItem from './comment/CommentItem'
import CommentInput from './comment/CommentInput'
import { useAppContext } from '@/context/useAppContext'
import { Skeleton } from './ui/skeleton'

interface VideoCommentProps {
  className?: string
  commentCount: number
  videoId: string
  channelId: string
}

const VideoComment = ({
  className,
  videoId,
  channelId,
  commentCount
}: VideoCommentProps) => {
  const { user } = useAppContext()

  const [commentThreads, setCommentThreads] = useState<
    CommentThreadInterface[]
  >([])

  const [text, setText] = useState('')
  const [order, setOrder] = useState<'relevance' | 'time'>('relevance')
  const [isLoading, setIsLoading] = useState(false)

  const handleFilter = (type: 'time' | 'relevance') => {
    if (order === type) return
    setOrder(type)
  }

  const toggleReplies = (id: string) => {
    setCommentThreads(prev => {
      return prev.map(commentThread => {
        if (commentThread.id === id) {
          return {
            ...commentThread,
            isShowReplies: !commentThread.isShowReplies
          }
        }
        return commentThread
      })
    })
  }

  const handleComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!videoId || !channelId || !text) return

    const { comments, error } = await commentTopLevel({
      videoId,
      channelId,
      text
    })

    if (error) {
      toast.error(error)
    }

    if (comments) {
      setCommentThreads(prev => [comments as CommentThreadInterface, ...prev])
      setText('')
      toast.success('Comment posted successfully')
    }
  }

  const fetchComments = useCallback(async () => {
    if (!videoId) return

    setIsLoading(true)

    const { comments, error } = await getVideoComments(videoId, order)

    if (error) {
      toast.error(error)
    }

    if (comments) {
      setCommentThreads(comments as CommentThreadInterface[])
    }

    setIsLoading(false)
  }, [videoId, order])

  const fetchRepliedOtherComments = async () => {
    const { error, repliedOtherComments } = await getRepliedOtherComments(
      videoId
    )

    if (error) {
      toast.error(error)
    }

    if (repliedOtherComments) {
      setCommentThreads(prev =>
        prev.map(commentThread => {
          if (repliedOtherComments[commentThread.id]) {
            return {
              ...commentThread,
              snippet: {
                ...commentThread.snippet,
                totalReplyCount:
                  commentThread.snippet.totalReplyCount +
                  repliedOtherComments[commentThread.id].length
              },
              replies: {
                comments: [
                  ...repliedOtherComments[commentThread.id],
                  ...(commentThread.replies?.comments || [])
                ]
              }
            }
          }
          return commentThread
        })
      )
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      // Await the first fetch
      await fetchComments()

      // If not a Google sign-in user, fetch other comments
      if (!user?.isGoogleSignin) {
        await fetchRepliedOtherComments()
      }

      setIsLoading(false)
    }

    fetchData()
  }, [fetchComments, user?.isGoogleSignin])

  const renderedCommentThreads = commentThreads.map(commentThread => {
    const {
      id,
      replies,
      snippet: { totalReplyCount, topLevelComment },
      isShowReplies
    } = commentThread

    return (
      <div key={commentThread.id} className='space-y-1'>
        <CommentItem
          comment={topLevelComment}
          setCommentThreads={setCommentThreads}
        />

        {totalReplyCount > 0 &&
          replies?.comments &&
          replies?.comments.length > 0 && (
            <div
              className='flex ml-14 items-center gap-2 text-blue-500 p-2 w-fit rounded-full cursor-pointer hover:bg-blue-400/50 transition-colors duration-200'
              onClick={() => toggleReplies(id)}
            >
              {isShowReplies ? (
                <GoChevronUp className='text-lg' />
              ) : (
                <GoChevronDown className='text-lg' />
              )}
              <p className='text-sm font-medium'>
                {formatCompactNumber(totalReplyCount)} replies
              </p>
            </div>
          )}

        {isShowReplies && replies?.comments && replies?.comments.length > 0 && (
          <div className='space-y-4 ml-14'>
            {replies.comments.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                type='reply'
                setCommentThreads={setCommentThreads}
              />
            ))}
          </div>
        )}
      </div>
    )
  })

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center gap-4'>
        <p className='text-xl font-semibold'>
          {formatViewCount(+commentCount)} Comments
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='flex items-center gap-2 cursor-pointer'>
              <BsFilterLeft className='text-3xl' />
              <p className='font-medium'>Sort by</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-green-950 text-white'>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => handleFilter('relevance')}
                className=''
              >
                Top comments
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilter('time')}
                className=''
              >
                Newest first
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommentInput onSubmit={handleComment} setText={setText} text={text} />

      <div className='space-y-4'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='flex gap-4'>
              <Skeleton className='rounded-full size-10' />

              <div className='space-y-1 flex-1'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-8 w-full' />
              </div>
            </div>
          ))
        ) : commentThreads.length > 0 ? (
          renderedCommentThreads
        ) : (
          <p className='text-center text-gray-400'>No comment yet</p>
        )}
      </div>
    </div>
  )
}

export default VideoComment
