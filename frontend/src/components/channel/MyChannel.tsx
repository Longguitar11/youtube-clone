import { useAppContext } from '@/context/useAppContext'
import { useEffect, useState } from 'react'
import MenuBar from './MenuBar'
import CustomizeChannelDialog, {
  type ChannelFormValues
} from './CustomizeChannelDialog'
import { editChannelProfile } from '@/api/youtube'
import toast from 'react-hot-toast'

const MyChannel = () => {
  const { fetchUser, user } = useAppContext()

  const [isCustomizeChannel, setIsCustomizeChannel] = useState(false)
  const [isChannelProfileEditing, setIsChannelProfileEditing] = useState(false)

  const onCustomizeChannelSubmit = async (values: ChannelFormValues) => {
    setIsChannelProfileEditing(true)

    const { displayName, name, bannerUrl, description, profileUrl } = values

    const passedData = {
      name,
      displayName,
      description: description || '',
      profileUrl: profileUrl || '',
      bannerUrl: bannerUrl || ''
    }

    const { error, message } = await editChannelProfile(passedData)

    if (error) {
      toast.error(error)
    }

    if (message) {
      fetchUser()
      toast.success(message)
    }

    setIsChannelProfileEditing(false)
    setIsCustomizeChannel(false)
  }

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (!user) return null

  const { channelId, description, displayName, name, profileUrl, bannerUrl } =
    user.channel

  const renderedUser = (
    <>
      <img
        src={bannerUrl || '/banner-placeholder.png'}
        alt={name}
        className='w-full h-20 sm:h-24 md:h-36 lg:h-48 object-cover rounded-2xl'
      />

      <div className='flex gap-4 items-center'>
        <img
          src={profileUrl || '/user.png'}
          alt={name}
          className='w-20 h-20 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 rounded-full'
        />

        <div className='space-y-1 sm:space-y-2 text-xs lg:text-sm'>
          <p className='font-bold text-2xl sm:text-4xl'>
            {name || displayName.split('@')[1]}
          </p>
          <div className='flex flex-col sm:flex-row gap-1 sm:gap-2 sm:items-center text-gray-400 whitespace-nowrap'>
            <p className='font-medium text-white'>{displayName || ''}</p>
            <div className='flex gap-2 items-center'>
              <p>0 subscribers</p>
              <p>0 videos</p>
            </div>
          </div>
          <p className='truncate w-72 hidden sm:block text-gray-400'>
            {description}
          </p>

          <CustomizeChannelDialog
            isOpen={isCustomizeChannel}
            isSubmitting={isChannelProfileEditing}
            setIsOpen={setIsCustomizeChannel}
            onSubmit={onCustomizeChannelSubmit}
            buttonClassName='hidden md:inline-block'
          />
        </div>
      </div>
    </>
  )

  return (
    <div className='text-white mx-10 space-y-4'>
      {renderedUser}

      <p className='truncate w-72 text-xs block sm:hidden text-gray-400'>
        {description}
      </p>

      <CustomizeChannelDialog
        isOpen={isCustomizeChannel}
        isSubmitting={isChannelProfileEditing}
        setIsOpen={setIsCustomizeChannel}
        onSubmit={onCustomizeChannelSubmit}
        buttonClassName='inline-block md:hidden w-full'
      />

      <MenuBar channelId={channelId!} tab={'posts'} />
    </div>
  )
}

export default MyChannel
