import { beauty } from '../utils/beauty';

export class FlipTransformer implements Transformer<VideoFrame, VideoFrame> {
  private canvas?: OffscreenCanvas;
  private ctx?: OffscreenCanvasRenderingContext2D | null;

  private initCanvas(
    width: number,
    height: number,
  ): [OffscreenCanvas, OffscreenCanvasRenderingContext2D | null] {
    if (this.canvas && this.ctx) {
      return [this.canvas, this.ctx];
    }
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { desynchronized: true });
    ctx?.translate(canvas.width, 0);
    ctx?.scale(-1, 1);
    this.ctx = ctx;
    this.canvas = canvas;
    return [canvas, ctx];
  }

  transform(
    frame: VideoFrame,
    controller: TransformStreamDefaultController<VideoFrame>,
  ) {
    const width = frame.displayWidth;
    const height = frame.displayHeight;
    const [canvas, ctx] = this.initCanvas(width, height);
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(frame, 0, 0);
      const data = ctx.getImageData(0, 0, width, height);
      if (data) {
        ctx.clearRect(0, 0, width, height);
        beauty(data.data, data.width, data.height, 5);
        ctx?.putImageData(data, 0, 0, 0, 0, width, height);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(frame, 0, 0);
      }
      const newFrame = new VideoFrame(canvas);
      controller.enqueue(newFrame);
      frame.close();
    } else {
      controller.enqueue(frame);
    }
  }
}
