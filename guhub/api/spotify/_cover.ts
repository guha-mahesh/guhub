// Renders the current album art as a 1-bit BMP for the Xteink e-reader.
//
// Lives in a leading-underscore module so Vercel does not count it as its own
// serverless function - the Hobby plan caps at 12, and player.ts simply
// imports this and exposes it as ?action=cover.
//
// The panel is 528x792 and pure black and white. A photograph mapped by a
// plain threshold turns to mud, so the art is contrast-stretched and then
// Floyd-Steinberg dithered, which is what makes a photo legible in 1-bit.
// Output is a 1-bit BMP (~53 KB) rather than 24-bit (~1.2 MB): the device
// pulls this over WiFi, and 24 bits per pixel buys nothing on a 1-bit screen.

import jpeg from 'jpeg-js';

export const PANEL_W = 528;
export const PANEL_H = 792;

const MARGIN = 24;
const CAPTION_TOP_GAP = 18;

/** Nearest-neighbour box sample. The source is far larger than the target and
 *  the result is dithered anyway, so a heavier filter is not worth the CPU. */
function resizeGray(
  src: Uint8Array, sw: number, sh: number,
  dw: number, dh: number,
): Uint8Array {
  const out = new Uint8Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    const sy = Math.min(sh - 1, Math.floor((y * sh) / dh));
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(sw - 1, Math.floor((x * sw) / dw));
      out[y * dw + x] = src[sy * sw + sx];
    }
  }
  return out;
}

/** Square centre-crop, so non-square art is not distorted. */
function cropSquare(src: Uint8Array, w: number, h: number): { data: Uint8Array; size: number } {
  const size = Math.min(w, h);
  const ox = ((w - size) / 2) | 0;
  const oy = ((h - size) / 2) | 0;
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) out[y * size + x] = src[(y + oy) * w + (x + ox)];
  }
  return { data: out, size };
}

/** Stretch to full range, ignoring 2% tails. Album art is often dark or flat,
 *  and without this the dither collapses to a near-black block. */
function autoContrast(data: Uint8Array): void {
  const hist = new Uint32Array(256);
  for (const v of data) hist[v]++;
  const cut = Math.floor(data.length * 0.02);

  let lo = 0, hi = 255, acc = 0;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > cut) { lo = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > cut) { hi = i; break; } }
  if (hi <= lo) return;

  const scale = 255 / (hi - lo);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.max(0, Math.min(255, Math.round((data[i] - lo) * scale)));
  }
}

/** Floyd-Steinberg into a 1-bit buffer, 1 = white. */
function dither(gray: Uint8Array, w: number, h: number): Uint8Array {
  const buf = Float32Array.from(gray);
  const bits = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const old = buf[i];
      const next = old < 128 ? 0 : 255;
      bits[i] = next ? 1 : 0;
      const err = old - next;
      if (x + 1 < w) buf[i + 1] += (err * 7) / 16;
      if (y + 1 < h) {
        if (x > 0) buf[i + w - 1] += (err * 3) / 16;
        buf[i + w] += (err * 5) / 16;
        if (x + 1 < w) buf[i + w + 1] += err / 16;
      }
    }
  }
  return bits;
}

/** Uncompressed 1-bit BMP. Rows are bottom-up and padded to 4 bytes. */
function encodeBmp1(bits: Uint8Array, w: number, h: number): Buffer {
  const rowBytes = Math.ceil(w / 8);
  const padded = Math.ceil(rowBytes / 4) * 4;
  const pixels = padded * h;
  const offset = 14 + 40 + 8; // header + info + 2-colour palette
  const buf = Buffer.alloc(offset + pixels, 0);

  buf.write('BM', 0);
  buf.writeUInt32LE(offset + pixels, 2);
  buf.writeUInt32LE(offset, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(w, 18);
  buf.writeInt32LE(h, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(1, 28);      // 1 bpp
  buf.writeUInt32LE(0, 30);      // BI_RGB
  buf.writeUInt32LE(pixels, 34);
  buf.writeUInt32LE(2, 46);      // colours used
  // Palette: index 0 black, index 1 white.
  buf.writeUInt32LE(0x00000000, 54);
  buf.writeUInt32LE(0x00ffffff, 58);

  for (let y = 0; y < h; y++) {
    const srcRow = (h - 1 - y) * w;   // BMP rows run bottom-up
    const dstRow = offset + y * padded;
    for (let x = 0; x < w; x++) {
      if (bits[srcRow + x]) buf[dstRow + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return buf;
}

/** Fetch the artwork and render the full panel image. */
export async function renderCover(artUrl: string): Promise<Buffer> {
  const res = await fetch(artUrl);
  if (!res.ok) throw new Error(`art fetch failed: ${res.status}`);
  const raw = Buffer.from(await res.arrayBuffer());

  const decoded = jpeg.decode(raw, { useTArray: true });
  const gray = new Uint8Array(decoded.width * decoded.height);
  for (let i = 0; i < gray.length; i++) {
    const p = i * 4;
    // Rec. 601 luma.
    gray[i] = (decoded.data[p] * 0.299 + decoded.data[p + 1] * 0.587 + decoded.data[p + 2] * 0.114) | 0;
  }

  const square = cropSquare(gray, decoded.width, decoded.height);
  const side = PANEL_W - MARGIN * 2;
  const art = resizeGray(square.data, square.size, square.size, side, side);
  autoContrast(art);

  // White canvas with the cover squared at the top, matching the reader's
  // sleep-screen layout.
  const canvas = new Uint8Array(PANEL_W * PANEL_H).fill(255);
  for (let y = 0; y < side; y++) {
    canvas.set(art.subarray(y * side, (y + 1) * side), (y + MARGIN) * PANEL_W + MARGIN);
  }

  // Hairline under the art so it reads as a panel rather than a floating square.
  const ruleY = MARGIN + side + CAPTION_TOP_GAP;
  if (ruleY < PANEL_H) {
    for (let x = MARGIN; x < PANEL_W - MARGIN; x++) {
      canvas[ruleY * PANEL_W + x] = 0;
      canvas[(ruleY + 1) * PANEL_W + x] = 0;
    }
  }

  return encodeBmp1(dither(canvas, PANEL_W, PANEL_H), PANEL_W, PANEL_H);
}
