function invert(pixes: Uint8ClampedArray) {
  for (let i = 0, len = pixes.length; i < len; i += 4) {
    pixes[i] = 255 - pixes[i]; //r
    pixes[i + 1] = 255 - pixes[i + 1]; //g
    pixes[i + 2] = 255 - pixes[i + 2]; //b
  }
  return pixes;
}

function alpha(pixes: Uint8ClampedArray, percent = 75) {
  for (let i = 3, len = pixes.length; i < len; i += 4) {
    pixes[i] = 255 / (100 / percent);
  }
  return pixes;
}
const screenx = function (
  basePixes: Uint8ClampedArray,
  mixPixes: Uint8ClampedArray,
) {
  const InvertBasePixes = invert(basePixes),
    InvertMixPixes = invert(mixPixes);

  for (let i = 0, len = basePixes.length; i < len; i += 4) {
    basePixes[i] = 255 - (InvertMixPixes[i] * InvertBasePixes[i]) / 255;
    basePixes[i + 1] =
      255 - (InvertMixPixes[i + 1] * InvertBasePixes[i + 1]) / 255;
    basePixes[i + 2] =
      255 - (InvertMixPixes[i + 2] * InvertBasePixes[i + 2]) / 255;
  }

  return basePixes;
};

const RGB2HSV = function (r: number, g: number, b: number, hsv: number[]) {
  let K = 0.0,
    swap = 0;
  if (g < b) {
    swap = g;
    g = b;
    b = swap;
    K = -1.0;
  }
  if (r < g) {
    swap = r;
    r = g;
    g = swap;
    K = -2.0 / 6.0 - K;
  }
  const chroma = r - (g < b ? g : b);
  hsv[0] = Math.abs(K + (g - b) / (6.0 * chroma + 1e-20));
  hsv[1] = chroma / (r + 1e-20);
  hsv[2] = r;
};

const HSVToRgb = function (rgb: number[], hsv: number[]) {
  let h = hsv[0];
  const s = hsv[1];
  const v = hsv[2];

  // The HUE should be at range [0, 1], convert 1.0 to 0.0 if needed.
  if (h >= 1.0) {
    h -= 1.0;
  }

  h *= 6.0;
  const index = Math.floor(h);

  const f = h - index;
  const p = v * (1.0 - s);
  const q = v * (1.0 - s * f);
  const t = v * (1.0 - s * (1.0 - f));

  switch (index) {
    case 0:
      rgb[0] = v;
      rgb[1] = t;
      rgb[2] = p;
      return;
    case 1:
      rgb[0] = q;
      rgb[1] = v;
      rgb[2] = p;
      return;
    case 2:
      rgb[0] = p;
      rgb[1] = v;
      rgb[2] = t;
      return;
    case 3:
      rgb[0] = p;
      rgb[1] = q;
      rgb[2] = v;
      return;
    case 4:
      rgb[0] = t;
      rgb[1] = p;
      rgb[2] = v;
      return;
    case 5:
      rgb[0] = v;
      rgb[1] = p;
      rgb[2] = q;
      return;
  }
};

const saturation = function (pixes: Uint8ClampedArray) {
  let r, g, b;
  const rgb = [0, 0, 0],
    hsv = [0.0, 0.0, 0.0];

  for (let i = 0, len = pixes.length; i < len; i += 4) {
    r = pixes[i];
    g = pixes[i + 1];
    b = pixes[i + 2];

    RGB2HSV(r, g, b, hsv); //rgb转hsv

    const satDelta = hsv[1];
    if (Math.abs(satDelta) < 1) {
      hsv[1] += 0.02;

      HSVToRgb(rgb, hsv); //hsv转rgb

      pixes[i] = rgb[0];
      pixes[i + 1] = rgb[1];
      pixes[i + 2] = rgb[2];
    }
  }

  return pixes;
};

function gaussBlur(
  pixes: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  sigma: number,
) {
  const gaussMatrix = [];
  let gaussSum = 0,
    x,
    y,
    r,
    g,
    b,
    a,
    i,
    j,
    k,
    len;

  radius = Math.floor(radius) || 3;
  sigma = sigma || radius / 3;

  a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
  b = -1 / (2 * sigma * sigma);
  //生成高斯矩阵
  for (i = 0, x = -radius; x <= radius; x++, i++) {
    g = a * Math.exp(b * x * x);
    gaussMatrix[i] = g;
    gaussSum += g;
  }
  //归一化, 保证高斯矩阵的值在[0,1]之间
  for (i = 0, len = gaussMatrix.length; i < len; i++) {
    gaussMatrix[i] /= gaussSum;
  }
  //x 方向一维高斯运算
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      r = g = b = a = 0;
      gaussSum = 0;
      for (j = -radius; j <= radius; j++) {
        k = x + j;
        if (k >= 0 && k < width) {
          //确保 k 没超出 x 的范围
          //r,g,b,a 四个一组
          i = (y * width + k) * 4;
          r += pixes[i] * gaussMatrix[j + radius];
          g += pixes[i + 1] * gaussMatrix[j + radius];
          b += pixes[i + 2] * gaussMatrix[j + radius];
          gaussSum += gaussMatrix[j + radius];
        }
      }
      i = (y * width + x) * 4;
      // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
      // console.log(gaussSum)
      pixes[i] = r / gaussSum;
      pixes[i + 1] = g / gaussSum;
      pixes[i + 2] = b / gaussSum;
    }
  }
  //y 方向一维高斯运算
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      r = g = b = a = 0;
      gaussSum = 0;
      for (j = -radius; j <= radius; j++) {
        k = y + j;
        if (k >= 0 && k < height) {
          //确保 k 没超出 y 的范围
          i = (k * width + x) * 4;
          r += pixes[i] * gaussMatrix[j + radius];
          g += pixes[i + 1] * gaussMatrix[j + radius];
          b += pixes[i + 2] * gaussMatrix[j + radius];
          gaussSum += gaussMatrix[j + radius];
        }
      }
      i = (y * width + x) * 4;
      pixes[i] = r / gaussSum;
      pixes[i + 1] = g / gaussSum;
      pixes[i + 2] = b / gaussSum;
    }
  }
  //end
  return pixes;
}

export const beauty = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  sigma: number,
) => {
  screenx(data, data.slice());
  gaussBlur(data, width, height, 1, sigma);
  alpha(data);
  saturation(data);
};
