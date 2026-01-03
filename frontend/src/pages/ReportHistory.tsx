import { getReportedVideos } from '@/api/youtube'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { ReportedVideoInterface } from '@/types/youtube'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { VscDeviceCameraVideo } from 'react-icons/vsc'
import { useNavigate } from 'react-router-dom'

const ReportHistory = () => {
    const navigate = useNavigate()

  const [reportedVideos, setReportedVideos] = useState<
    ReportedVideoInterface[]
  >([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchReportedVideos = async () => {
    setIsLoading(true)

    const { error, reportedVideos } = await getReportedVideos()

    if (error) {
      toast.error(error)
    }

    if (reportedVideos) {
      setReportedVideos(reportedVideos)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchReportedVideos()
  }, [])

  if(isLoading) return <LoadingSpinner />

  const renderedReportedVideos = reportedVideos.length > 0 ? reportedVideos.map(reportedVideo => {
    const {
      channelTitle,
      videoTitle,
      createdAt,
      reasonTitle,
      status,
      type,
      videoId
    } = reportedVideo

    return (
      <tr key={videoId} className='border-b border-gray-400/50'>
        <td className='w-2/12'>
          <div className='flex gap-2 items-center'>
            <VscDeviceCameraVideo className='text-2xl' />
            <p className='capitalize'>{type}</p>
          </div>
        </td>
        <td className='w-5/12 space-y-2'>
          <p className='text-blue-500 line-clamp-2 cursor-pointer' onClick={() => navigate(`/watch/${videoId}`)}>{videoTitle}</p>
          <p className='text-xs text-gray-400'>{channelTitle}</p>
        </td>
        <td className='w-3/12 space-y-2'>
          <p className='line-clamp-2'>{reasonTitle}</p>
          <p className='text-xs text-gray-400'>
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </td>
        <td className='w-2/12'>
          <p className='capitalize'>{status}</p>
        </td>
      </tr>
    )
  }) : (
    <tr>
      <td colSpan={4} className='py-8 text-center text-gray-400'>
        You have not reported any videos.
      </td>
    </tr>
  )

  return (
    <div className='p-4'>
      <table className='w-full table table-auto text-white text-sm'>
        <thead className='text-neutral-500 p-4 text-left'>
          <tr className='border-b border-gray-400/50'>
            <th className='capitalize'>Type</th>
            <th>Content</th>
            <th>Reporting reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>{renderedReportedVideos}</tbody>
      </table>
    </div>
  )
}

export default ReportHistory
