importScripts('https://docs.opencv.org/4.5.4/opencv.js');

declare let cv: any;

let cvReady = false;
cv['onRuntimeInitialized'] = () => {
  cvReady = true;
};

function face2(image: any, value1?: number, value2?: number) {
  const dst = new cv.Mat();
  if (value1 == null || value1 == undefined) value1 = 3; //磨皮系数
  if (value2 == null || value2 == undefined) value2 = 1; //细节系数 0.5 - 2

  const dx = value1 * 5; //双边滤波参数
  const fc = value1 * 12.5; //参数
  const p = 0.1; //透明度

  const temp1 = new cv.Mat(),
    temp2 = new cv.Mat(),
    temp3 = new cv.Mat(),
    temp4 = new cv.Mat();

  cv.cvtColor(image, image, cv.COLOR_RGBA2RGB, 0);

  cv.bilateralFilter(image, temp1, dx, fc, fc); //bilateralFilter(Src)

  const temp22 = new cv.Mat();
  cv.subtract(temp1, image, temp22); //bilateralFilter(Src) - Src

  cv.add(
    temp22,
    new cv.Mat(
      image.rows,
      image.cols,
      image.type(),
      new cv.Scalar(128, 128, 128, 128),
    ),
    temp2,
  ); //bilateralFilter(Src) - Src + 128

  cv.GaussianBlur(
    temp2,
    temp3,
    new cv.Size(2 * value2 - 1, 2 * value2 - 1),
    0,
    0,
  );
  //2 * GuassBlur(bilateralFilter(Src) - Src + 128) - 1

  const temp44 = new cv.Mat();
  temp3.convertTo(temp44, temp3.type(), 2, -255);
  //2 * GuassBlur(bilateralFilter(Src) - Src + 128) - 256

  cv.add(image, temp44, temp4);
  cv.addWeighted(image, p, temp4, 1 - p, 0.0, dst);
  //Src * (100 - Opacity)

  cv.add(
    dst,
    new cv.Mat(
      image.rows,
      image.cols,
      image.type(),
      new cv.Scalar(10, 10, 10, 0),
    ),
    dst,
  );
  //(Src * (100 - Opacity) + (Src + 2 * GuassBlur(bilateralFilter(Src) - Src + 128) - 256) * Opacity) /100

  return dst;
}

export class BeautyTransformer implements Transformer<VideoFrame, VideoFrame> {
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
    if (ctx && cvReady) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(frame, 0, 0);
      const data = ctx.getImageData(0, 0, width, height);
      if (data) {
        const img1 = cv.matFromImageData(data);
        const s = performance.now();
        const img = face2(img1);
        console.log(performance.now() - s);

        img1.delete();
        const dst = new cv.Mat();
        const depth = img.type() % 8;
        const scale =
          depth <= cv.CV_8S ? 1 : depth <= cv.CV_32S ? 1 / 256 : 255;
        const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128 : 0;
        img.convertTo(dst, cv.CV_8U, scale, shift);
        switch (dst.type()) {
          case cv.CV_8UC1:
            cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
            break;
          case cv.CV_8UC3:
            cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);
            break;
          case cv.CV_8UC4:
            break;
          default:
            throw new Error(
              'Bad number of channels (Source image must have 1, 3 or 4 channels)',
            );
        }
        const newData = new ImageData(
          new Uint8ClampedArray(dst.data),
          dst.cols,
          dst.rows,
        );
        ctx.clearRect(0, 0, width, height);
        ctx.putImageData(newData, 0, 0, 0, 0, width, height);
        dst.delete();
        img.delete();
      }
      const newFrame = new VideoFrame(canvas);
      controller.enqueue(newFrame);
      frame.close();
    } else {
      controller.enqueue(frame);
    }
  }
}
