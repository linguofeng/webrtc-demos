import { useRef, useEffect } from 'react';
import videojs, { VideoJsPlayerOptions, VideoJsPlayer } from 'video.js';
import 'video.js/dist/video-js.css';
import './index.css';
import './CommentInput';
import './EmojiPlugin';

type Props = {
  options: VideoJsPlayerOptions;
  onReady?: (player: VideoJsPlayer) => void;
};

export const VideoJS: React.FC<Props> = ({ options, onReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer>();

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) {
        return;
      }

      playerRef.current = videojs(videoElement, options, () => {
        if (playerRef.current) {
          onReady?.(playerRef.current);
        }
      });
    } else {
      const player = playerRef.current;
      if (options.sources) {
        if (player.options_.sources) {
          if (options.sources[0].src === player.options_.sources[0].src) {
            return;
          }
        }

        player.src(options.sources);
        player.pause();
      }
    }
  }, [options]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = undefined;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoJS;
