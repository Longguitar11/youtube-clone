import { useAppContext } from '@/context/useAppContext'
import { cn } from '@/lib/utils'
import type { PostInterface } from '@/types/youtube'
import { timeAgo } from '@/utils/youtube'
import PostRendering from './PostRendering'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { useCallback, useState, type Dispatch } from 'react'
import { deletePost, editPost } from '@/api/youtube'
import toast from 'react-hot-toast'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { Button } from '@/components/ui/button'

interface PostItemProps {
  post: PostInterface
  setPosts: Dispatch<React.SetStateAction<PostInterface[]>>
  className?: string
}

const PostItem = ({ post, setPosts, className }: PostItemProps) => {
  const { createdAt, type, text, id } = post

  const { user } = useAppContext()
  const [isEdit, setIsEdit] = useState(false)
  const [editedText, setEditedText] = useState(text || '')
  const [isEditing, setIsEditing] = useState(false)

  const deleteAPost = useCallback(async () => {
    const { error, message } = await deletePost({ postId: id })

    if (error) {
      toast.error(error)
    }

    if (message) {
      setPosts((pre: PostInterface[]) => pre.filter(post => post.id !== id))
      toast.success(message)
    }
  }, [id])

  const editAPost = useCallback(async () => {
    setIsEditing(true)

    const { error, message } = await editPost({
      postId: id,
      text: editedText
    })

    if (error) {
      toast.error(error)
    }

    if (message) {
      setPosts((pre: PostInterface[]) =>
        pre.map(post =>
          post.id === id
            ? {
                ...post,
                text: editedText
              }
            : post
        )
      )

      setIsEdit(false)
      toast.success(message)
    }

    setIsEditing(false)
  }, [id, editedText])

  if (!user) return null

  const {
    channel: { name, profileUrl }
  } = user

  return (
    <div
      className={cn(
        'p-4 rounded-xl border border-neutral-400/30 bg-neutral-800 relative',
        className
      )}
    >
      <div className='flex gap-4 '>
        <img src={profileUrl || '/user.png'} alt={name} className='size-10 rounded-full' />

        <div className='space-y-2 w-full'>
          <div className='flex gap-2 items-center text-gray-50'>
            <p className='text-sm font-medium'>{name || 'user'}</p>
            <p className='text-xs'>{timeAgo(createdAt)}</p>
          </div>

          <div className='space-y-2'>
            <PostRendering
              post={post}
              isEdit={isEdit}
              editedText={editedText}
              setEditedText={setEditedText}
            />
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className='p-1 cursor-pointer absolute top-2 right-2 hover:bg-neutral-500/50 rounded-full'>
          <BiDotsVerticalRounded
            className={cn('text-2xl', isEdit && 'hidden')}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='bg-neutral-700 border-none'>
          <DropdownMenuGroup>
            {type !== 'quiz' && text && (
              <DropdownMenuItem onClick={() => setIsEdit(true)}>
                Edit
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={deleteAPost}>Delete</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {isEdit && (
        <div className='flex justify-end items-center gap-4'>
          <Button
            variant='secondary'
            onClick={() => {
              setIsEdit(false)
              setEditedText(text || '')
            }}
          >
            Cancel
          </Button>
          <Button
            className='bg-blue-500 hover:bg-white hover:text-blue-600 transition-colors duration-200'
            onClick={editAPost}
            disabled={isEditing}
          >
            {isEditing ? 'Editing...' : 'Edit'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PostItem
