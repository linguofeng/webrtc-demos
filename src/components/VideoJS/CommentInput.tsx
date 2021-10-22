import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';

const Component = videojs.getComponent('Component');

type CommentInputOptions = {
  onMount: (el: Element) => void;
};

class CommentInput extends Component {
  constructor(
    player: VideoJsPlayer,
    options?: { playerOptions: VideoJsPlayerOptions },
  ) {
    super(player);

    const ops = options?.playerOptions.plugins
      ?.commentInput as CommentInputOptions;

    player.ready(() => {
      ops.onMount(this.el());
    });

    this.setAttribute('style', 'flex: 1');
  }
}

videojs.registerComponent('CommentInput', CommentInput);

videojs.registerPlugin('commentInput', function () {
  //
});