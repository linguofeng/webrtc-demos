import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { VideoJS } from '../../components/VideoJS';
import { Emoji } from './Emoji';

export const PlayerPage: React.FC = () => {
  const emojiElRef = useRef<Element>();
  const [showEmojiEl, setShowEmojiEl] = useState(false);

  return (
    <div>
      <VideoJS
        options={{
          controls: true,
          responsive: true,
          fluid: true,
          sources: [
            {
              src: 'https://vjs.zencdn.net/v/oceans.mp4',
              type: 'video/mp4',
            },
          ],
          playbackRates: [0.5, 1, 1.5, 2],
          controlBar: {
            children: [
              'playToggle',
              'currentTimeDisplay',
              'timeDivider',
              'durationDisplay',
              'progressControl',
              'commentInput',
              'playbackRateMenuButton',
              'volumePanel',
              'fullscreenToggle',
            ],
            volumePanel: {
              inline: false,
              volumeControl: {
                vertical: true,
              },
            },
          },
          plugins: {
            emoji: {
              onMount: (el: Element) => {
                emojiElRef.current = el;
                setShowEmojiEl(true);
              },
            },
            commentInput: {
              onMount: (el: Element) => {
                // commentInputElRef.current = el;
                // commentInput.on();
              },
            },
          },
        }}
      />
      {showEmojiEl &&
        emojiElRef.current &&
        createPortal(<Emoji />, emojiElRef.current)}
    </div>
  );
};
