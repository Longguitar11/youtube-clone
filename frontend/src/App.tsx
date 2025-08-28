import './App.css'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'
import Layout from './pages/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import { useAppContext } from './context/useAppContext'
import { useEffect } from 'react'
import HistoryPage from './pages/HistoryPage'
import LikedVideoPage from './pages/LikedVideoPage'
import WatchPage from './pages/WatchPage'
import ChannelPage from './pages/ChannelPage'
import NewsPage from './pages/NewsPage'
import ReportHistory from './pages/ReportHistory'

function App () {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, isUserLoading } = useAppContext()

  useEffect(() => {
    if (isUserLoading) return

    if (!user && !isUserLoading) {
      if (pathname !== '/login' && pathname !== '/signup') {
        navigate('/login')
      }
    } else {
      if (pathname === '/login' || pathname === '/signup') {
        navigate('/')
      }
    }
  }, [user, pathname, isUserLoading])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [pathname])

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path='login' element={<LoginPage />} />
        <Route path='signup' element={<SignupPage />} />
        <Route path='watch/:videoId' element={<WatchPage />} />
        <Route path='channel/:channelId/:tab?' element={<ChannelPage />} />
        <Route path='history' element={<HistoryPage />} />
        <Route path='liked-videos' element={<LikedVideoPage />} />
        <Route path='news' element={<NewsPage />} />
        <Route path='report-history' element={<ReportHistory />} />
        <Route path='*' element={<Navigate to='/' />} />
      </Route>
    </Routes>
  )
}

export default App
