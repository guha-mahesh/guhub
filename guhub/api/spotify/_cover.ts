// Renders the current album art as a 1-bit BMP for the Xteink e-reader.
//
// Leading underscore so Vercel does not treat this as its own serverless
// function - the Hobby plan caps at 12, and player.ts just imports it and
// exposes it as ?action=cover.
//
// The panel is 528x792 and pure black and white, and the device has no room
// to decode or resample a JPEG itself. So everything happens here: decode,
// square-crop, contrast-stretch, Floyd-Steinberg dither, and emit a 1-bit BMP
// (~53 KB rather than ~1.2 MB at 24bpp, which matters over a phone hotspot).

import jpeg from 'jpeg-js';

export const PANEL_W = 528;
export const PANEL_H = 792;

const MARGIN = 24;
const RULE_GAP = 18;

/** Box-average downsample.
 *
 *  NOT nearest-neighbour: album art is full of fine repeating detail, and
 *  point-sampling it aliases that into what looks like static once dithered.
 *  Averaging every source pixel that falls in a destination cell is the
 *  cheap fix, and matters far more here than filter quality normally would
 *  because the 1-bit dither amplifies whatever noise survives. */
function resizeGray(src: Uint8Array, sw: number, sh: number, dw: number, dh: number): Uint8Array {
  const out = new Uint8Array(dw * dh);
  for (let y = 0; y < dh; y++) {
    const y0 = Math.floor((y * sh) / dh);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * sh) / dh));
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor((x * sw) / dw);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * sw) / dw));
      let sum = 0;
      let n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          sum += src[sy * sw + sx];
          n++;
        }
      }
      out[y * dw + x] = n ? (sum / n) | 0 : 0;
    }
  }
  return out;
}

/** Centre square crop, so non-square art is not stretched. */
function cropSquare(src: Uint8Array, w: number, h: number) {
  const size = Math.min(w, h);
  const ox = ((w - size) / 2) | 0;
  const oy = ((h - size) / 2) | 0;
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) out[y * size + x] = src[(y + oy) * w + (x + ox)];
  }
  return { data: out, size };
}

/** Stretch to full range ignoring 2% tails. Album art is often dark or flat,
 *  and without this the dither collapses to a near-black block. */
function autoContrast(data: Uint8Array): void {
  const hist = new Uint32Array(256);
  for (const v of data) hist[v]++;
  const cut = Math.floor(data.length * 0.02);
  let lo = 0;
  let hi = 255;
  let acc = 0;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > cut) { lo = i; break; } }
  acc = 0;
  for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > cut) { hi = i; break; } }
  if (hi <= lo) return;
  const scale = 255 / (hi - lo);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.max(0, Math.min(255, Math.round((data[i] - lo) * scale)));
  }
}

/** Floyd-Steinberg to 1 bit. 1 = white. */
function dither(gray: Uint8Array, w: number, h: number): Uint8Array {
  const buf = Float32Array.from(gray);
  const bits = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const next = buf[i] < 128 ? 0 : 255;
      bits[i] = next ? 1 : 0;
      const err = buf[i] - next;
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

/** Uncompressed 1-bit BMP: rows bottom-up, padded to 4 bytes. */
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
  buf.writeUInt16LE(1, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(pixels, 34);
  buf.writeUInt32LE(2, 46);
  buf.writeUInt32LE(0x00000000, 54); // index 0 = black
  buf.writeUInt32LE(0x00ffffff, 58); // index 1 = white

  for (let y = 0; y < h; y++) {
    const src = (h - 1 - y) * w; // BMP rows run bottom-up
    const dst = offset + y * padded;
    for (let x = 0; x < w; x++) {
      if (bits[src + x]) buf[dst + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return buf;
}

export async function renderCover(artUrl: string): Promise<Buffer> {
  const res = await fetch(artUrl);
  if (!res.ok) throw new Error(`art fetch failed: ${res.status}`);

  const decoded = jpeg.decode(Buffer.from(await res.arrayBuffer()), { useTArray: true });
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

  const canvas = new Uint8Array(PANEL_W * PANEL_H).fill(255);
  for (let y = 0; y < side; y++) {
    canvas.set(art.subarray(y * side, (y + 1) * side), (y + MARGIN) * PANEL_W + MARGIN);
  }

  // Hairline under the art so it reads as a composed panel.
  const ruleY = MARGIN + side + RULE_GAP;
  if (ruleY + 1 < PANEL_H) {
    for (let x = MARGIN; x < PANEL_W - MARGIN; x++) {
      canvas[ruleY * PANEL_W + x] = 0;
      canvas[(ruleY + 1) * PANEL_W + x] = 0;
    }
  }

  return encodeBmp1(dither(canvas, PANEL_W, PANEL_H), PANEL_W, PANEL_H);
}
