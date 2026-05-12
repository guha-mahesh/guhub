// ──────────────────────────────────────────────────────────────────────
// Take an uploaded image File, trim its near-white / transparent border
// to a tight bbox, downscale so the long edge is at most MAX_EDGE px,
// and return a PNG data URL. Used before persisting to localStorage so
// (a) the stored size stays small and (b) the fish floats inside its
// own outline rather than a giant white rectangle.
// ──────────────────────────────────────────────────────────────────────

const MAX_EDGE = 400;
const NEAR_WHITE = 240;     // R/G/B threshold above which a pixel reads as "background"
const ALPHA_MIN = 8;        // alpha below which a pixel reads as transparent

export async function processFishImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const trimmed = trimBackground(img);
    const resized = resize(trimmed, MAX_EDGE);
    return resized.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load image'));
    img.src = src;
  });
}

function trimBackground(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.drawImage(img, 0, 0);

  let pixels: Uint8ClampedArray;
  try {
    pixels = ctx.getImageData(0, 0, c.width, c.height).data;
  } catch {
    // can fail if the image is cross-origin and tainted. user uploads
    // are local files via FileReader / object URL so this shouldn't
    // happen, but if it does we just skip trimming.
    return c;
  }

  let minX = c.width, minY = c.height, maxX = -1, maxY = -1;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const a = pixels[i + 3];
      if (a < ALPHA_MIN) continue;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      if (r >= NEAR_WHITE && g >= NEAR_WHITE && b >= NEAR_WHITE) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0 || maxY < 0) return c; // entirely background, give up

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  out.getContext('2d')!.drawImage(c, minX, minY, w, h, 0, 0, w, h);
  return out;
}

function resize(src: HTMLCanvasElement, maxEdge: number): HTMLCanvasElement {
  const w = src.width;
  const h = src.height;
  const longest = Math.max(w, h);
  if (longest <= maxEdge) return src;
  const ratio = maxEdge / longest;
  const out = document.createElement('canvas');
  out.width = Math.round(w * ratio);
  out.height = Math.round(h * ratio);
  const ctx = out.getContext('2d');
  if (!ctx) return src;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, out.width, out.height);
  return out;
}
