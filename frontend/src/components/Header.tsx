import { FiMenu } from 'react-icons/fi'
import { FaYoutube } from 'react-icons/fa6'
import { PiSignOut } from 'react-icons/pi'
import { IoMdArrowBack } from 'react-icons/io'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '@/context/useAppContext'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger
} from '@/components/ui/drawer'
import { logout } from '@/api/auth'
import type { SidebarProps } from '@/types/sidebar'
import { sidebarItems } from '@/constants/sidebar'
import SearchBar from './SearchBar'
import CreateButton from './header/CreateButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { useEffect, useState } from 'react'
import IconButton from './IconButton'
import { cn } from '@/lib/utils'

const Header = ({ setSidebarStatus }: SidebarProps) => {
  const { user, setUser } = useAppContext()
  const { pathname } = useLocation()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isSmallSearchOpen, setIsSmallSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  const handleSidebar = () => {
    setSidebarStatus!(prev =>
      prev === 'large' ? 'small' : prev === 'small' ? 'large' : prev
    )
  }

  useEffect(() => {
    const handleResize = () => {
      if (!pathname.includes('watch')) {
        if (window.innerWidth >= 1024) {
          setSidebarStatus!('large')
        } else if (window.innerWidth >= 768) {
          setSidebarStatus!('small')
        } else {
          setSidebarStatus!('close')
        }
      }

      if (window.innerWidth <= 768) {
        setIsSmallScreen(true)
      } else {
        setIsSmallSearchOpen(false)
        setIsSmallScreen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [pathname])

  if (!user) return null

  const {
    channel: { displayName, name, profileUrl, channelId }
  } = user

  return (
    <div className='fixed z-10 top-0 left-0 w-full p-2 h-14 border-b border-gray-200/20 bg-gray-900 flex items-center justify-between px-4 sm:px-6'>
      <div
        className={cn('flex items-center gap-4', isSmallSearchOpen && 'hidden')}
      >
        {!pathname.includes('watch') && !isSmallScreen ? (
          <FiMenu
            onClick={handleSidebar}
            className='text-2xl text-gray-200 cursor-pointer'
          />
        ) : (
          <Drawer direction='left'>
            <DrawerTrigger asChild>
              <FiMenu className='text-2xl text-gray-200 cursor-pointer' />
            </DrawerTrigger>
            <DrawerContent className='bg-neutral-900 text-gray-100 !w-3xs border-none'>
              {sidebarItems.map((section, index) => (
                <div key={index} className={cn('border-b last:border-0 border-gray-400/30 py-2', section.name && !section.items && 'hidden')}>
                  {section.name && (
                    <p className='font-medium ml-4 py-2'>{section.name}</p>
                  )}

                  {section.items?.map(item => (
                    <DrawerClose asChild key={item.name}>
                      <Link
                        to={item.to}
                        className='flex items-center gap-4 py-2 px-4 hover:bg-gray-800 transition-colors duration-200 cursor-pointer'
                      >
                        {item.icon}
                        <span className='text-sm'>{item.name}</span>
                      </Link>
                    </DrawerClose>
                  ))}
                </div>
              ))}
            </DrawerContent>
          </Drawer>
        )}

        <Link to='/'>
          <FaYoutube className='text-3xl text-red-600' />
        </Link>
      </div>

      {!isSmallScreen && <SearchBar />}

      <div
        className={cn(
          'text-white flex items-center gap-3',
          isSmallSearchOpen && 'w-full'
        )}
      >
        {isSmallSearchOpen && (
          <div
            className='p-2 cursor-pointer rounded-full hover:bg-neutral-700 transition-colors duration-200'
            onClick={() => setIsSmallSearchOpen(false)}
          >
            <IoMdArrowBack className='text-2xl' />
          </div>
        )}

        {isSmallScreen && (
          <SearchBar
            className='block'
            isSmallScreen={true}
            isSmallSearchOpen={isSmallSearchOpen}
            setIsSmallSearchOpen={setIsSmallSearchOpen}
          />
        )}

        <CreateButton buttonClassName={isSmallSearchOpen ? 'hidden' : ''} />

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <img
              src={profileUrl || '/user.png'}
              alt='profile'
              className={cn(
                'w-8 h-8 rounded-full cursor-pointer',
                isSmallSearchOpen && 'hidden'
              )}
              onClick={() => setIsDropdownOpen(prev => !prev)}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-green-950 text-white'>
            <div className='flex gap-4 p-4 border-b border-gray-200/20 bg-'>
              <img
                src={profileUrl || '/user.png'}
                alt={name}
                className='w-10 h-10 rounded-full'
              />
              <div className='space-y-2'>
                <div className='space-y-1'>
                  <p>{name || 'user'}</p>
                  <p className='text-sm'>{displayName}</p>
                </div>
                <Link
                  to={`/channel/${channelId}`}
                  onClick={() => setIsDropdownOpen(false)}
                  className='text-sm text-blue-500'
                >
                  View your channel
                </Link>
              </div>
            </div>

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleLogout}
                className='text-base'
                asChild
              >
                <IconButton text='Logout' textClassName='font-normal'>
                  <PiSignOut className='text-xl' />
                </IconButton>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Header
