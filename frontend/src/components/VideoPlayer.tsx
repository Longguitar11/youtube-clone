import YouTube from 'react-youtube';

const VideoPlayer = ({ videoId }: { videoId: string }) => {
  const opts = {
    playerVars: {
      autoplay: 1,
    },
  };

  return <YouTube videoId={videoId} opts={opts} className='react-youtube' />;
};

export default VideoPlayer;
