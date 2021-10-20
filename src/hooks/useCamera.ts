import { transfer, wrap } from 'comlink';
import { useEffect, useRef } from 'react';
import type { MediaWorker } from '../workers/MediaWorker';

const createStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });

  const [track] = stream.getVideoTracks();
  const trackProcessor = new MediaStreamTrackProcessor({ track });
  const trackGenerator = new MediaStreamTrackGenerator({ kind: 'video' });

  const mediaWorker = wrap<MediaWorker>(
    new Worker(new URL('../workers/MediaWorker.ts', import.meta.url)),
  );

  mediaWorker.beauty(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    transfer(trackProcessor.readable, [trackProcessor.readable]),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    transfer(trackGenerator.writable, [trackGenerator.writable]),
  );

  return new MediaStream([trackGenerator]);
};

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    createStream().then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  return {
    videoRef,
  };
};
