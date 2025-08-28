import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Input } from './ui/input'
import { FiSearch } from 'react-icons/fi'
import { TiDeleteOutline } from 'react-icons/ti'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/context/useAppContext'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

interface SearchBarProps {
  className?: string
  isSmallScreen?: boolean
  setIsSmallSearchOpen?: (value: boolean) => void
  isSmallSearchOpen?: boolean
}

const SearchBar = ({
  className,
  isSmallSearchOpen,
  isSmallScreen,
  setIsSmallSearchOpen
}: SearchBarProps) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearchTerm = searchParams.get('q') || ''

  const { setSearchTerm } = useAppContext()
  const [searchValue, setSearchValue] = useState(initialSearchTerm)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    setSearchParams({ q: value })
  }

  const handleSearchButton = () => {
    if (!isSmallScreen) return

    setIsSmallSearchOpen!(true)
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setSearchTerm((pre: string) => {
        if (pre !== searchValue) {
          if (pathname !== '/') {
            navigate('/?q=' + searchValue)
            return searchValue
          }

          return searchValue
        }

        return pre
      })
    }, 800)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, pathname])

  return (
    <div className={cn('relative', className, isSmallSearchOpen && 'w-full')}>
      <Input
        placeholder='Search...'
        className={cn(
          'rounded-full border-gray-300/60 text-white h-10 w-sm md:w-md lg:w-xl hidden sm:flex',
          isSmallSearchOpen && 'flex w-full'
        )}
        value={searchValue}
        onChange={handleSearchChange}
      />
      {searchValue && (
        <TiDeleteOutline
          className={cn(
            'text-3xl absolute top-1/2 -translate-y-1/2 right-8 text-gray-400 cursor-pointer hidden sm:block hover:text-red-500 transition-colors duration-200',
            isSmallSearchOpen && 'block'
          )}
          onClick={() => {
            setSearchValue('')
            setSearchParams({ q: '' })
          }}
        />
      )}
      <FiSearch
        className={cn(
          'text-2xl sm:text-xl absolute top-1/2 -translate-y-1/2 right-2 text-gray-400 cursor-pointer sm:cursor-default',
          isSmallSearchOpen && 'text-xl cursor-default'
        )}
        onClick={handleSearchButton}
      />
    </div>
  )
}

export default SearchBar
