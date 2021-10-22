import videojs, { VideoJsPlayer } from 'video.js';
import './EmojiPlugin.css';

const Component = videojs.getComponent('Component');

type EmojiOptions = {
  onMount: (el: Element) => void;
};

class Emoji extends Component {
  constructor(player: VideoJsPlayer, options?: EmojiOptions) {
    super(player);

    player.ready(() => {
      options?.onMount(this.el());
    });

    this.setAttribute('class', 'vjs-emoji');
  }
}

videojs.registerComponent('Emoji', Emoji);

videojs.registerPlugin('emoji', function (options: EmojiOptions) {
  this.addChild('emoji', options);
});
