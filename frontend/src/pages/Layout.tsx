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
    <>
      {isUserLoading ? (
        <LoadingSpinner className='h-screen' />
      ) : user ? (
        <div className='bg-primary'>
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
        </div>
      ) : (
        <div className='relative min-h-screen bg-slate-900 flex items-center justify-center overflow-hidden'>
          <div className='absolute w-[40rem] h-[40rem] bg-blue-500 rounded-full blur-[200px] top-[-10rem] left-[-10rem] opacity-30'></div>
          <div className='absolute w-[40rem] h-[40rem] bg-red-500 rounded-full blur-[200px] bottom-[-10rem] right-[-10rem] opacity-30'></div>

          <div className='relative z-10 bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-4 sm:p-8 max-sm:w-[calc(100%-2rem)]'>
            <Outlet />
          </div>
        </div>
      )}

      <Toaster position='top-right' />
    </>
  )
}

export default Layout
