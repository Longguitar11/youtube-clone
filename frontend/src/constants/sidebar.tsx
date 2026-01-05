import React from 'react'
import { AiOutlineHome } from 'react-icons/ai'
import { BiLike } from 'react-icons/bi'
import { GoHistory } from 'react-icons/go'
// import { MdOutlineSubscriptions } from 'react-icons/md'
import { IoFlagOutline, IoMusicalNotesOutline } from 'react-icons/io5'
import { MdNewspaper } from 'react-icons/md'
import { SiYoutubegaming } from 'react-icons/si'
import { TfiCup } from 'react-icons/tfi'

interface SidebarItem {
  name: string
  to: string
  icon: React.ReactNode
}

interface SidebarSection {
  name?: string
  items?: SidebarItem[]
}

export const sidebarItems: SidebarSection[] = [
  {
    items: [
      {
        name: 'Home',
        to: '/',
        icon: <AiOutlineHome className='text-2xl' />
      }
    ]
  },
  {
    name: 'Subscriptions'
  },
  {
    name: 'You',
    items: [
      {
        name: 'History',
        to: '/history',
        icon: <GoHistory className='text-2xl' />
      },
      {
        name: 'Liked videos',
        to: '/liked-videos',
        icon: <BiLike className='text-2xl' />
      }
    ]
  },
  {
    name: 'Explore',
    items: [
      {
        name: 'Music',
        to: '/music',
        icon: <IoMusicalNotesOutline className='text-2xl' />
      },
      {
        name: 'Gaming',
        to: '/gaming',
        icon: <SiYoutubegaming className='text-2xl' />
      },
      {
        name: 'News',
        to: '/news',
        icon: <MdNewspaper className='text-2xl' />
      },
      {
        name: 'Sports',
        to: '/sports',
        icon: <TfiCup className='text-2xl' />
      }
    ]
  },
  {
    items: [
      {
        name: 'Report history',
        to: '/report-history',
        icon: <IoFlagOutline className='text-2xl' />
      }
    ]
  }
]
