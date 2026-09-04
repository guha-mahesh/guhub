#!/usr/bin/env python3
"""Run an image through the Noria crimson augmentation.

The /noria page is one flat crimson field (#6b0a0a) with black ink on it. Any
photograph or painting dropped in raw reads as a sticker, so every image gets
pushed through the same treatment the Lautrec poster got: crushed to near
luminance, tinted into the page's crimson, darkened hard, split slightly on the
red/blue channels so it bleeds like bad registration, then faded to transparent
at the edges so it dissolves into the ground instead of ending at a rectangle.

    python3 scripts/noria_augment.py IN.png public/art/noria_beast.png
    python3 scripts/noria_augment.py IN.png OUT.png --oval --trim 6
"""

from __future__ import annotations

import argparse

import numpy as np
from PIL import Image, ImageFilter

# The page's two colours, so augmented art lands inside the same palette.
CRIMSON = np.array([0x6B, 0x0A, 0x0A], dtype=np.float32)
INK = np.array([0x05, 0x05, 0x05], dtype=np.float32)

SATURATION_KEPT = 0.22   # how much of the original hue survives
GAMMA = 1.75             # >1 crushes the midtones toward the ink
CHANNEL_SPLIT = 2        # pixels of red/blue misregistration
BLOOM_RADIUS = 1.4


def crimson_duotone(rgb: np.ndarray) -> np.ndarray:
    """Map an RGB array to the ink-to-crimson ramp, keeping a trace of hue."""
    luminance = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    ramp = (luminance / 255.0) ** GAMMA
    duotone = INK + (CRIMSON * 2.6 - INK) * ramp[..., None]
    return np.clip(duotone * (1 - SATURATION_KEPT) + rgb * SATURATION_KEPT, 0, 255)


def split_channels(image: Image.Image, offset: int) -> Image.Image:
    """Shift red right and blue left so edges carry a printing-error fringe."""
    red, green, blue = image.split()
    red = red.transform(red.size, Image.AFFINE, (1, 0, -offset, 0, 1, 0))
    blue = blue.transform(blue.size, Image.AFFINE, (1, 0, offset, 0, 1, 0))
    return Image.merge("RGB", (red, green, blue))


def edge_fade(width: int, height: int, oval: bool) -> Image.Image:
    """Alpha mask: an oval cameo, or a rectangle whose borders melt away."""
    x = np.linspace(-1, 1, width, dtype=np.float32)[None, :]
    y = np.linspace(-1, 1, height, dtype=np.float32)[:, None]
    if oval:
        radius = np.sqrt((x / 0.94) ** 2 + (y / 0.94) ** 2)
        alpha = np.clip((1.0 - radius) / 0.18, 0, 1)
    else:
        alpha = np.clip((1 - np.abs(x)) / 0.16, 0, 1) * np.clip((1 - np.abs(y)) / 0.16, 0, 1)
    return Image.fromarray((alpha * 255).astype(np.uint8), mode="L")


def augment(source: str, destination: str, trim: int, oval: bool, width: int | None) -> None:
    image = Image.open(source).convert("RGB")
    if trim:
        image = image.crop((trim, trim, image.width - trim, image.height - trim))
    if width and image.width > width:
        height = round(image.height * width / image.width)
        image = image.resize((width, height), Image.LANCZOS)

    toned = Image.fromarray(crimson_duotone(np.asarray(image, dtype=np.float32)).astype(np.uint8))
    toned = split_channels(toned, CHANNEL_SPLIT)
    toned = toned.filter(ImageFilter.GaussianBlur(BLOOM_RADIUS * 0.5))

    toned.putalpha(edge_fade(toned.width, toned.height, oval))
    toned.save(destination)
    print(f"{source} -> {destination} ({toned.width}x{toned.height}, oval={oval})", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source")
    parser.add_argument("destination")
    parser.add_argument("--trim", type=int, default=0, help="pixels to crop off every side first")
    parser.add_argument("--oval", action="store_true", help="mask to an oval cameo instead of a soft rectangle")
    parser.add_argument("--width", type=int, default=720, help="downscale to this width (0 keeps the original)")
    arguments = parser.parse_args()
    augment(arguments.source, arguments.destination, arguments.trim, arguments.oval, arguments.width or None)


if __name__ == "__main__":
    main()
