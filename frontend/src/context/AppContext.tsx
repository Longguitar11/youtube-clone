import { checkAuth } from '@/api/auth'
import {
  getChannelById,
  getDislikedCommentIds,
  getDislikedVideoIds,
  getLikedCommentIds,
  getLikedVideoIds,
  getReportReasons,
  getSubscriptionIds,
  getVideos,
  ratingComment,
  ratingVideo,
  searchVideos,
  subscribeChannel
} from '@/api/youtube'
import type { UserInterface } from '@/types/user'
import type {
  ChannelInterface,
  ReportReasonInterface,
  YoutubeVideoInterface
} from '@/types/youtube'
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction
} from 'react'
import toast from 'react-hot-toast'

interface AppContextInterface {
  user: UserInterface | null
  videos: YoutubeVideoInterface[] | []
  searchTerm: string
  observerTargetRef: RefObject<HTMLDivElement | null> | null
  nextPageToken: string | null
  isUserLoading: boolean
  isVideoLoading: boolean
  isChannelLoading: boolean
  subscriptionIds: string[]
  likedVideoIds: string[]
  dislikedVideoIds: string[]
  likedCommentIds: string[]
  dislikedCommentIds: string[]
  channel: ChannelInterface | null
  reportReasons: ReportReasonInterface[]
  subscribe: (channelId: string) => Promise<void>
  setUser: (user: UserInterface | null) => void
  setSearchTerm: Dispatch<SetStateAction<string>>
  fetchVideos: () => Promise<void>
  fetchUser: () => Promise<void>
  fetchChannel: (channel: string) => Promise<void>
  ratingAVideo: (videoId: string, type: string) => Promise<void>
  ratingAComment: (commentId: string, type: 'like' | 'dislike') => Promise<void>
}

const AppContext = createContext<AppContextInterface>({
  user: null,
  videos: [],
  searchTerm: '',
  nextPageToken: '',
  observerTargetRef: null,
  channel: null,
  isUserLoading: true,
  isVideoLoading: false,
  isChannelLoading: false,
  subscriptionIds: [],
  likedVideoIds: [],
  dislikedVideoIds: [],
  likedCommentIds: [],
  dislikedCommentIds: [],
  reportReasons: [],
  setUser: () => {},
  setSearchTerm: () => {},
  subscribe: async () => {},
  fetchVideos: async () => {},
  fetchUser: async () => {},
  fetchChannel: async () => {},
  ratingAVideo: async () => {},
  ratingAComment: async () => {}
})

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInterface | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([])
  const [likedVideoIds, setLikedVideoIds] = useState<string[]>([])
  const [dislikedVideoIds, setDislikedVideoIds] = useState<string[]>([])
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])
  const [dislikedCommentIds, setDislikedCommentIds] = useState<string[]>([])
  const [channel, setChannel] = useState<ChannelInterface | null>(null)
  const [videoList, setVideoList] = useState<{
    home: { videos: YoutubeVideoInterface[]; nextPageToken: string }
    search: { videos: YoutubeVideoInterface[]; nextPageToken: string }
  }>({
    home: { videos: [], nextPageToken: '' },
    search: { videos: [], nextPageToken: '' }
  })
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [isChannelLoading, setIsChannelLoading] = useState(false)

  const searchParams = new URLSearchParams(window.location.search)
  const initialSearchTerm = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '')
  const [reportReasons, setReportReasons] = useState<ReportReasonInterface[]>(
    []
  )

  const prevSearchTermRef = useRef<string>('')
  const observerTargetRef = useRef<HTMLDivElement | null>(null)

  const fetchSubscriptionIds = useCallback(async () => {
    const { error, ids } = await getSubscriptionIds()

    if (error) {
      toast.error(error)
    }

    if (ids) {
      setSubscriptionIds(ids)
    }
  }, [])

  const fetchLikedVideoIds = useCallback(async () => {
    const { error, ids } = await getLikedVideoIds()

    if (error) {
      toast.error(error)
    }

    if (ids) {
      setLikedVideoIds(ids)
    }
  }, [])

  const fetchDislikedVideoIds = useCallback(async () => {
    const { error, ids } = await getDislikedVideoIds()

    if (error) {
      toast.error(error)
    }

    if (ids) {
      setDislikedVideoIds(ids)
    }
  }, [])

  const fetchLikedCommentIds = useCallback(async () => {
    const { error, ids } = await getLikedCommentIds()

    if (error) {
      toast.error(error)
    }

    if (ids) {
      setLikedCommentIds(ids)
    }
  }, [])

  const fetchDislikedCommentIds = useCallback(async () => {
    const { error, ids } = await getDislikedCommentIds()

    if (error) {
      toast.error(error)
    }

    if (ids) {
      setDislikedCommentIds(ids)
    }
  }, [])

  const fetchChannel = useCallback(async (channelId: string) => {
    if (isChannelLoading) return

    console.log('fetch channel')
    
    setIsChannelLoading(true)
    const { error, channels: channel } = await getChannelById(channelId)

    if (error) {
      toast.error(error)
    }

    if (channel) {
      setChannel(channel as ChannelInterface)
    }
    setIsChannelLoading(false)
  }, [isChannelLoading])

  const fetchVideos = useCallback(async () => {
    if (isVideoLoading) return

    setIsVideoLoading(true)

    const { error, result } = await getVideos(videoList.home.nextPageToken)

    if (error) {
      toast.error(error)
      setVideoList({
        home: { videos: [], nextPageToken: '' },
        search: { videos: [], nextPageToken: '' }
      })
    }

    if (result && (result.items as YoutubeVideoInterface[])) {
      setVideoList(preList => ({
        search: { nextPageToken: '', videos: [] },
        home: {
          videos: [
            ...preList.home.videos,
            ...(result.items as YoutubeVideoInterface[])
          ],
          nextPageToken: result.nextPageToken
        }
      }))
    }

    setIsVideoLoading(false)
  }, [isVideoLoading, videoList.home.nextPageToken])

  const searchVideosByTerm = useCallback(async () => {
    if (isVideoLoading) return

    setIsVideoLoading(true)

    if (prevSearchTermRef.current !== searchTerm) {
      setVideoList({
        home: { videos: [], nextPageToken: '' },
        search: { videos: [], nextPageToken: '' }
      })
    }

    const { error, result } = await searchVideos(
      searchTerm,
      videoList.search.nextPageToken
    )

    if (error) {
      toast.error(error)
      setVideoList({
        home: { videos: [], nextPageToken: '' },
        search: { videos: [], nextPageToken: '' }
      })
    }

    if (result && (result.items as YoutubeVideoInterface[])) {
      setVideoList(preList => ({
        ...preList,
        search: {
          videos: [
            ...preList.search.videos,
            ...(result.items as YoutubeVideoInterface[])
          ],
          nextPageToken: result.nextPageToken
        }
      }))
    }

    prevSearchTermRef.current = searchTerm

    setIsVideoLoading(false)
  }, [searchTerm, isVideoLoading, videoList.search.nextPageToken])

  const ratingAVideo = async (videoId: string, type: string) => {
    const { message, error } = await ratingVideo({ videoId, type })

    if (error) {
      toast.error(error)
    }

    if (message) {
      if (type === 'like') {
        if (likedVideoIds.includes(videoId)) {
          setLikedVideoIds(likedVideoIds.filter(id => id !== videoId))
        } else {
          if (dislikedVideoIds.includes(videoId)) {
            setDislikedVideoIds(dislikedVideoIds.filter(id => id !== videoId))
          }
          setLikedVideoIds([...likedVideoIds, videoId])
        }
      } else {
        if (dislikedVideoIds.includes(videoId)) {
          setDislikedVideoIds(dislikedVideoIds.filter(id => id !== videoId))
        } else {
          if (likedVideoIds.includes(videoId)) {
            setLikedVideoIds(likedVideoIds.filter(id => id !== videoId))
          }
          setDislikedVideoIds([...dislikedVideoIds, videoId])
        }
      }
      toast.success(message)
    }
  }

  const ratingAComment = async (
    commentId: string,
    type: 'like' | 'dislike'
  ) => {
    const { message, error } = await ratingComment({ commentId, type })

    if (error) {
      toast.error(error)
    }

    if (message) {
      if (type === 'like') {
        if (likedCommentIds.includes(commentId)) {
          setLikedCommentIds(likedCommentIds.filter(id => id !== commentId))
        } else {
          if (dislikedCommentIds.includes(commentId)) {
            setDislikedCommentIds(
              dislikedCommentIds.filter(id => id !== commentId)
            )
          }
          setLikedCommentIds([...likedCommentIds, commentId])
        }
      } else {
        if (dislikedCommentIds.includes(commentId)) {
          setDislikedCommentIds(
            dislikedCommentIds.filter(id => id !== commentId)
          )
        } else {
          if (likedCommentIds.includes(commentId)) {
            setLikedCommentIds(likedCommentIds.filter(id => id !== commentId))
          }
          setDislikedCommentIds([...dislikedCommentIds, commentId])
        }
      }
      toast.success(message)
    }
  }

  const subscribe = async (channelId: string) => {
    const { message, error } = await subscribeChannel(channelId)

    if (error) {
      toast.error(error)
    }

    if (message) {
      toast.success(message)
      fetchSubscriptionIds()
    }
  }

  const fetchReportReasons = async () => {
    const { error, reasons } = await getReportReasons()

    if (error) {
      toast.error(error)
    }

    if (reasons) {
      setReportReasons(reasons)
    }
  }

  const checkAuthentication = useCallback(async () => {
    const { user, error } = await checkAuth()

    if (error) {
      setUser(null)
      toast.error(error, { id: 'auth-error' })
    } else {
      setUser(user)
    }

    setIsUserLoading(false)
  }, [])

  useEffect(() => {
    const nextPageToken = searchTerm
      ? videoList.search.nextPageToken
      : videoList.home.nextPageToken

    if (!observerTargetRef.current || !nextPageToken || isVideoLoading) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (searchTerm) {
            searchVideosByTerm()
          } else {
            fetchVideos()
          }
        }
      },
      { threshold: 0.1 }
    )

    const target = observerTargetRef.current
    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    videoList.home.nextPageToken,
    videoList.search.nextPageToken,
    searchTerm,
    isVideoLoading,
    observerTargetRef.current,
    fetchVideos,
    searchVideosByTerm
  ])

  useEffect(() => {
    checkAuthentication()
    fetchReportReasons()

    if (!user?.isGoogleSignin) {
      fetchSubscriptionIds()
      fetchLikedVideoIds()
      fetchDislikedVideoIds()
      fetchLikedCommentIds()
      fetchDislikedCommentIds()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (searchTerm) {
      searchVideosByTerm()
    } else {
      fetchVideos() // FIRST FETCH VIDEO OR SEARCH TERM -> DELETE SEARCH TERM
    }
  }, [searchTerm])

  return (
    <AppContext.Provider
      value={{
        user,
        videos: searchTerm ? videoList.search.videos : videoList.home.videos,
        nextPageToken: searchTerm
          ? videoList.search.nextPageToken
          : videoList.home.nextPageToken,
        observerTargetRef,
        searchTerm,
        channel,
        isUserLoading,
        isVideoLoading,
        isChannelLoading,
        subscriptionIds,
        likedVideoIds,
        dislikedVideoIds,
        likedCommentIds,
        dislikedCommentIds,
        reportReasons,
        setUser,
        subscribe,
        setSearchTerm,
        fetchUser: checkAuthentication,
        fetchVideos,
        fetchChannel,
        ratingAVideo,
        ratingAComment
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, ContextProvider }
