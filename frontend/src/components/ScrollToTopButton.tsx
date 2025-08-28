import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className='p-3 rounded-full cursor-pointer bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors duration-200'
        >
          <ArrowUp className='w-5 h-5' />
        </button>
      )}
    </div>
  )
}

export default ScrollToTopButton
