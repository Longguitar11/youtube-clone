import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { useAppContext } from '@/context/useAppContext'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { SidebarStatus } from '@/types/sidebar'
import ScrollToTopButton from '@/components/ScrollToTopButton'

const Layout = () => {
  const { pathname } = useLocation()
  const [sidebarStatus, setSidebarStatus] = useState<SidebarStatus>('small')
  const { user, isUserLoading } = useAppContext()

  useEffect(() => {
    // close sidebar when watching video
    if (pathname.includes('watch')) setSidebarStatus('close')
    else setSidebarStatus('small')
  }, [pathname])

  return (
    <div className='bg-primary'>
      {isUserLoading ? (
        <LoadingSpinner className='h-screen' />
      ) : user ? (
        <>
          <Header setSidebarStatus={setSidebarStatus} />
          <Sidebar sidebarStatus={sidebarStatus} />
          <div
            className={cn(
              'mt-14 min-h-[calc(100vh-56px)]',
              sidebarStatus === 'large'
                ? 'ml-[256px]'
                : sidebarStatus === 'small' && 'ml-20'
            )}
          >
            <Outlet />
            <ScrollToTopButton />
          </div>
        </>
      ) : (
        <Outlet />
      )}

      <Toaster position='top-right' />
    </div>
  )
}

export default Layout
