import { expose } from 'comlink';
import { FlipTransformer } from '../transformers/FlipTransformer';

const beauty = (
  readable: ReadableStream<VideoFrame>,
  writable: WritableStream<VideoFrame>,
) => {
  readable
    .pipeThrough(new TransformStream(new FlipTransformer()))
    .pipeTo(writable);
};

expose({
  beauty,
});

export type MediaWorker = {
  beauty: typeof beauty;
};
