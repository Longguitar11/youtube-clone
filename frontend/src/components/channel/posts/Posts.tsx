import { useCallback, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Input } from '../../ui/input'
import IconButton from '../../IconButton'
import { IoImageOutline } from 'react-icons/io5'
import { IoMdCheckboxOutline } from 'react-icons/io'
import { TiDeleteOutline } from 'react-icons/ti'
import { useDropzone } from 'react-dropzone'
import { useAppContext } from '@/context/useAppContext'
import { Button } from '../../ui/button'
import { createPost, getMyPosts } from '@/api/youtube'
import toast from 'react-hot-toast'
import type { PostInterface, QuizInterface } from '@/types/youtube'
import PostItem from './PostItem'
import LoadingSpinner from '../../LoadingSpinner'
import QuizForm, { type QuizFormValues } from './QuizForm'

const Posts = () => {
  const { user } = useAppContext()

  const [text, setText] = useState('')
  const [type, setType] = useState<'text' | 'image' | 'quiz'>('text')
  const [previewImages, setPreviewImages] = useState<File[]>([])
  const [images, setImages] = useState<string[]>([])
  const [posts, setPosts] = useState<PostInterface[]>([])
  const [isPostsLoading, setIsPostsLoading] = useState(false)
  const [isCreatePostLoading, setIsCreatePostLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      setPreviewImages(pre => [...pre, file])

      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const binaryStr = reader.result as string
        setImages(pre => [...pre, binaryStr])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
    multiple: true
  })

  const handleRemoveImage = (index: number) => {
    setPreviewImages(pre => pre.filter((_, i) => i !== index))
    setImages(pre => pre.filter((_, i) => i !== index))
  }

  const handleCancel = () => {
    setText('')
    setType('text')
    setPreviewImages([])
    setImages([])
  }

  const handlePost = useCallback(
    async (quiz?: QuizInterface[]) => {
      setIsCreatePostLoading(true)

      const id = uuid()

      const { error, message } = await createPost({
        id,
        type,
        text,
        quiz,
        images
      })

      if (error) {
        toast.error(error)
      }

      if (message) {
        setPosts([
          {
            text,
            type,
            images: images.length > 0 ? images : undefined,
            quiz,
            createdAt: new Date(),
            id
          },
          ...posts
        ])

        handleCancel()
        toast.success(message)
      }

      setIsCreatePostLoading(false)
    },
    [text, type, images, posts]
  )

  const onQuizFormSubmit = async (quiz: QuizFormValues) => {
    console.log({ quiz: quiz.answers })
    await handlePost(quiz.answers)
  }

  const fetchMyPosts = async () => {
    setIsPostsLoading(true)
    const { error, posts } = await getMyPosts()

    if (error) {
      toast.error(error)
    }

    if (posts) {
      setPosts(posts)
    }

    setIsPostsLoading(false)
  }

  useEffect(() => {
    fetchMyPosts()
  }, [])

  return (
    <div className='mt-4 w-full'>
      <div className='rounded-xl border border-neutral-400/30 bg-neutral-800 p-4 text-white space-y-2'>
        <div className='flex gap-4 items-center'>
          <img
            src={user?.channel.profileUrl || './user.png'}
            alt={user?.channel.name}
            className='size-10 rounded-full'
          />
          <p className='font-medium text-sm'>{user?.channel.name}</p>
        </div>

        <Input
          placeholder='Post an update to your fans'
          value={text}
          onChange={e => setText(e.target.value)}
          className='border-none focus-visible:ring-0'
        />

        {type === 'text' ? (
          <div className='flex justify-between items-center'>
            <div className='flex gap-4 items-center'>
              <IconButton text='Image' onClick={() => setType('image')}>
                <IoImageOutline className='text-2xl' />
              </IconButton>
              <IconButton text='Quiz' onClick={() => setType('quiz')}>
                <IoMdCheckboxOutline className='text-2xl' />
              </IconButton>
            </div>

            <div className='flex gap-2 items-center justify-end'>
              <Button disabled={!text} onClick={() => handlePost()}>
                {isCreatePostLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {type === 'image' && (
              <div className='space-y-4'>
                <div
                  {...getRootProps()}
                  className='flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-500 p-6 text-center cursor-pointer hover:bg-neutral-700/30'
                >
                  <input {...getInputProps()} type='file' />
                  {isDragActive ? (
                    <div className='w-full h-full'>
                      <p>Drop the files here ...</p>
                    </div>
                  ) : (
                    <div className='w-full h-full'>
                      <p>
                        Drag 'n' drop some files here, or click to select files
                      </p>
                    </div>
                  )}
                </div>

                <div className='flex gap-2 items-center justify-end'>
                  <Button variant={'secondary'} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    disabled={images.length === 0}
                    onClick={() => handlePost()}
                  >
                    {isCreatePostLoading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            )}

            {type === 'quiz' && (
              <QuizForm
                handleCancel={handleCancel}
                question={text}
                onSubmit={onQuizFormSubmit}
              />
            )}

            {/* Preview selected images */}
            {previewImages.length > 0 && (
              <div className='mt-4 grid grid-cols-3 gap-2'>
                {previewImages.map((img, index) => (
                  <div key={index} className='relative'>
                    <img
                      src={URL.createObjectURL(img)}
                      alt='preview'
                      className='w-full h-32 object-contain rounded-lg'
                    />

                    <TiDeleteOutline
                      className='text-2xl text-white absolute top-0 right-0 cursor-pointer hover:text-red-500 transition-colors duration-200'
                      onClick={() => handleRemoveImage(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* EXISTING POSTS */}
      {isPostsLoading ? (
        <LoadingSpinner className='h-40' />
      ) : !isPostsLoading && posts.length > 0 ? (
        <div className='mt-4 space-y-4'>
          {posts.map(post => (
            <PostItem key={post.id} post={post} setPosts={setPosts} />
          ))}
        </div>
      ) : (
        <p>No posts</p>
      )}
    </div>
  )
}

export default Posts
