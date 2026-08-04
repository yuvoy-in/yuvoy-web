#!/usr/bin/env python3
"""Derive the brand-mark assets from the official logo.

Input:  public/yuvoy-logo.png — the official ensō mark as delivered: white
        brush ring + terracotta dot on an OPAQUE black field with a radial
        glow (no alpha to lift).

The black field is removed mathematically rather than by editing the asset:
screen-blending onto the brand forest (#16362E) maps black to exactly the
tile colour and keeps the ring, dot and glow intact. The result is the one
mark object used everywhere — header tile, footer, favicon, app icon, OG
cards.

Outputs (all committed):
  public/brand/yuvoy-mark.png  512×512, forest tile + composited mark
  src/app/icon.png             the same 512 (Next.js app-icon convention)
  src/app/favicon.ico          256 PNG-in-ICO fallback

Pure standard library on purpose — the repo toolchain is Node, and this
machine's Python package installers are off limits (work-registry wiring), so
the script depends on nothing. Re-run after replacing the source logo:
  python3 scripts/generate-brand-assets.py
"""

from __future__ import annotations

import math
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "yuvoy-logo.png"
MARK = ROOT / "public" / "brand" / "yuvoy-mark.png"
MARK_ON_LIGHT = ROOT / "public" / "brand" / "yuvoy-mark-on-light.png"
MARK_ON_DARK = ROOT / "public" / "brand" / "yuvoy-mark-on-dark.png"
APP_ICON = ROOT / "src" / "app" / "icon.png"
FAVICON = ROOT / "src" / "app" / "favicon.ico"

FOREST = (0x16, 0x36, 0x2E)
CREAM = (0xF4, 0xEF, 0xE4)

# The cut-out marks are cropped tight: with no tile around them, padding just
# makes the ensō smaller in its box for no reason.
ALPHA_PAD = 0.03

# Pixels at least this bright count as "the mark" when finding its extent;
# the glow below it is kept only as far as the padded crop reaches.
BBOX_THRESHOLD = 140
BBOX_PAD = 0.14

# The source surrounds the mark with a huge radial halo. The halo is bright,
# but only the brush strokes themselves reach near-pure white, so a tight
# luminance window (MASK_LOW..MASK_HIGH, smoothstepped) isolates the strokes
# with a naturally anti-aliased edge and drops every trace of glow. The
# terracotta dot is not white, so a chroma mask carries it through unchanged.
# Owner direction 2026-08-03: the mark must be crisp, no glow.
MASK_LOW = 235
MASK_HIGH = 250


# --------------------------------------------------------------- PNG decode


def read_png(path: Path) -> tuple[int, int, bytearray]:
    """Return (width, height, RGB bytes) for an 8-bit RGB/RGBA/grey PNG."""
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        sys.exit(f"{path} is not a PNG")

    width = height = 0
    bit_depth = colour_type = 0
    idat = bytearray()
    pos = 8
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        ctype = data[pos + 4 : pos + 8]
        body = data[pos + 8 : pos + 8 + length]
        if ctype == b"IHDR":
            width, height, bit_depth, colour_type = struct.unpack(
                ">IIBB", body[:10]
            )
            if bit_depth != 8 or colour_type not in (0, 2, 6):
                sys.exit(f"unsupported PNG (depth {bit_depth} type {colour_type})")
        elif ctype == b"IDAT":
            idat.extend(body)
        elif ctype == b"IEND":
            break
        pos += 12 + length

    channels = {0: 1, 2: 3, 6: 4}[colour_type]
    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    out = bytearray(width * height * 3)
    previous = bytearray(stride)

    pos = 0
    for y in range(height):
        filter_type = raw[pos]
        pos += 1
        row = bytearray(raw[pos : pos + stride])
        pos += stride

        if filter_type == 1:  # Sub
            for i in range(channels, stride):
                row[i] = (row[i] + row[i - channels]) & 0xFF
        elif filter_type == 2:  # Up
            for i in range(stride):
                row[i] = (row[i] + previous[i]) & 0xFF
        elif filter_type == 3:  # Average
            for i in range(stride):
                left = row[i - channels] if i >= channels else 0
                row[i] = (row[i] + ((left + previous[i]) >> 1)) & 0xFF
        elif filter_type == 4:  # Paeth
            for i in range(stride):
                left = row[i - channels] if i >= channels else 0
                up = previous[i]
                up_left = previous[i - channels] if i >= channels else 0
                p = left + up - up_left
                pa, pb, pc = abs(p - left), abs(p - up), abs(p - up_left)
                if pa <= pb and pa <= pc:
                    predictor = left
                elif pb <= pc:
                    predictor = up
                else:
                    predictor = up_left
                row[i] = (row[i] + predictor) & 0xFF
        previous = row

        base = y * width * 3
        if channels == 1:
            for x in range(width):
                value = row[x]
                out[base + 3 * x : base + 3 * x + 3] = bytes((value, value, value))
        else:
            for x in range(width):
                src = x * channels
                out[base + 3 * x : base + 3 * x + 3] = row[src : src + 3]

    return width, height, out


# --------------------------------------------------------------- PNG encode


def write_png(path: Path, width: int, height: int, rgb: bytearray) -> None:
    # Emitted as RGBA (opaque) rather than RGB: Next's ICO/app-icon pipeline
    # refuses PNGs that are not in RGBA format.
    raw = bytearray()
    stride = width * 3
    for y in range(height):
        raw.append(0)  # no filter
        row = rgb[y * stride : (y + 1) * stride]
        for x in range(width):
            raw.extend(row[x * 3 : x * 3 + 3])
            raw.append(255)

    def chunk(ctype: bytes, body: bytes) -> bytes:
        return (
            struct.pack(">I", len(body))
            + ctype
            + body
            + struct.pack(">I", zlib.crc32(ctype + body) & 0xFFFFFFFF)
        )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


# --------------------------------------------------------------- transforms


def smoothstep(value: float, low: float, high: float) -> float:
    t = min(1.0, max(0.0, (value - low) / (high - low)))
    return t * t * (3 - 2 * t)


def extract_mark(rgb: bytearray, width: int, height: int) -> bytearray:
    """Keep near-white strokes and the warm dot; drop the halo entirely."""
    n = width * height
    out = bytearray(len(rgb))
    for i in range(n):
        r, g, b = rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]
        stroke = smoothstep(max(r, g, b), MASK_LOW, MASK_HIGH)
        white = int(255 * stroke)
        # The dot: strongly warm and bright. The window is tight so the warm
        # glow around the dot is dropped along with the white halo, leaving
        # only the solid disc with a softly stepped edge.
        dot = smoothstep(r - b, 55, 75) * smoothstep(r, 180, 210)
        out[i * 3] = int(white + (r - white) * dot)
        out[i * 3 + 1] = int(white + (g - white) * dot)
        out[i * 3 + 2] = int(white + (b - white) * dot)
    return out


def screen_blend(rgb: bytearray, base: tuple[int, int, int]) -> bytearray:
    """screen(base, src): black in the source becomes exactly the base."""
    lut = [
        [255 - ((255 - b) * (255 - s)) // 255 for s in range(256)] for b in base
    ]
    out = bytearray(len(rgb))
    for i in range(0, len(rgb), 3):
        out[i] = lut[0][rgb[i]]
        out[i + 1] = lut[1][rgb[i + 1]]
        out[i + 2] = lut[2][rgb[i + 2]]
    return out


def mark_bbox(width: int, height: int, rgb: bytearray) -> tuple[int, int, int, int]:
    min_x, min_y, max_x, max_y = width, height, -1, -1
    for y in range(height):
        base = y * width * 3
        for x in range(width):
            i = base + x * 3
            if max(rgb[i], rgb[i + 1], rgb[i + 2]) >= BBOX_THRESHOLD:
                if x < min_x:
                    min_x = x
                if x > max_x:
                    max_x = x
                if y < min_y:
                    min_y = y
                if y > max_y:
                    max_y = y
    if max_x < 0:
        sys.exit("found no mark pixels — is the source image right?")
    return min_x, min_y, max_x, max_y


def square_crop_bounds(
    bbox: tuple[int, int, int, int], width: int, height: int
) -> tuple[int, int, int]:
    """A padded square window centred on the mark, clamped to the image."""
    min_x, min_y, max_x, max_y = bbox
    side = max(max_x - min_x, max_y - min_y)
    side = min(int(side * (1 + 2 * BBOX_PAD)), width, height)
    cx = (min_x + max_x) // 2
    cy = (min_y + max_y) // 2
    x0 = max(0, min(width - side, cx - side // 2))
    y0 = max(0, min(height - side, cy - side // 2))
    return x0, y0, side


def _spans(start: float, window: float, out_size: int, limit: int):
    """
    For each output pixel, the source pixels it covers and by how much.

    Area averaging, not the 4-tap bilinear this used to do. Bilinear is a
    *magnifying* filter: shrinking with it samples four pixels out of the nine
    or more that land in each output pixel and throws the rest away, which is
    what made the mark look coarse and its thin brush strokes break up. Here
    every source pixel contributes in proportion to how much of the output
    pixel it covers, which is the whole difference between a resized image and
    a degraded one.
    """
    scale = window / out_size
    table = []
    for o in range(out_size):
        a = start + o * scale
        b = a + scale
        weights = []
        for i in range(int(math.floor(a)), int(math.ceil(b))):
            overlap = min(b, i + 1) - max(a, i)
            if overlap > 0:
                weights.append((max(0, min(limit - 1, i)), overlap))
        table.append(weights)
    return table


def resample_rgb(
    rgb: bytearray,
    src_w: int,
    src_h: int,
    x0: int,
    y0: int,
    window: int,
    out_size: int,
) -> bytearray:
    xs = _spans(x0, window, out_size, src_w)
    ys = _spans(y0, window, out_size, src_h)
    out = bytearray(out_size * out_size * 3)
    for oy, yw in enumerate(ys):
        for ox, xw in enumerate(xs):
            acc = [0.0, 0.0, 0.0]
            total = 0.0
            for sy, wy in yw:
                row = sy * src_w
                for sx, wx in xw:
                    w = wy * wx
                    total += w
                    i = (row + sx) * 3
                    acc[0] += rgb[i] * w
                    acc[1] += rgb[i + 1] * w
                    acc[2] += rgb[i + 2] * w
            o = (oy * out_size + ox) * 3
            for c in range(3):
                out[o + c] = int(acc[c] / total + 0.5)
    return out


def build_cut_out(
    rgb: bytearray, width: int, height: int, stroke: tuple[int, int, int]
) -> bytearray:
    """
    The mark with a real alpha channel: strokes in `stroke`, the dot in the
    colour it was delivered in, and nothing else painted at all.

    This is what the UI needs. The tiled version below bakes forest into every
    pixel, which is right for a favicon — an icon needs a body — and wrong
    everywhere else: on a forest section it drew a green square around a logo
    that should have had none.
    """
    out = bytearray(width * height * 4)
    for i in range(width * height):
        r, g, b = rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]
        # The strokes are neutral; the glow around the dot is warm. Without
        # the second term that glow passes the brightness test and paints a
        # pale smudge around the dot.
        ink = smoothstep(max(r, g, b), MASK_LOW, MASK_HIGH) * (
            1 - smoothstep(r - b, 18, 42)
        )
        # Measured off the source rather than guessed: the solid disc holds
        # r >= 209 and r-b >= 117 out to 12px, and the glow trails on for
        # another 80px. The old window let that trail through at low alpha,
        # which is what painted a pale square around the dot.
        dot = smoothstep(r - b, 95, 115) * smoothstep(r, 196, 212)
        alpha = min(1.0, max(ink, dot))
        if alpha <= 0.002:
            continue
        o = i * 4
        # The dot keeps the delivered colour; the strokes take the tone.
        out[o] = int(stroke[0] * (1 - dot) + r * dot)
        out[o + 1] = int(stroke[1] * (1 - dot) + g * dot)
        out[o + 2] = int(stroke[2] * (1 - dot) + b * dot)
        out[o + 3] = int(255 * alpha)
    return out


def alpha_bbox(rgba: bytearray, width: int, height: int) -> tuple[int, int, int, int]:
    min_x, min_y, max_x, max_y = width, height, -1, -1
    for y in range(height):
        for x in range(width):
            if rgba[(y * width + x) * 4 + 3] >= 24:
                min_x, max_x = min(min_x, x), max(max_x, x)
                min_y, max_y = min(min_y, y), max(max_y, y)
    if max_x < 0:
        sys.exit("the cut-out is empty — is the source image right?")
    return min_x, min_y, max_x, max_y


def resample_rgba(
    rgba: bytearray,
    src_w: int,
    src_h: int,
    x0: int,
    y0: int,
    window: int,
    out_size: int,
) -> bytearray:
    """
    Area averaging over *premultiplied* colour.

    Straight alpha would drag the colour of fully transparent pixels into the
    edges and fringe the whole mark.
    """
    xs = _spans(x0, window, out_size, src_w)
    ys = _spans(y0, window, out_size, src_h)
    out = bytearray(out_size * out_size * 4)
    for oy, yw in enumerate(ys):
        for ox, xw in enumerate(xs):
            acc = [0.0, 0.0, 0.0, 0.0]
            total = 0.0
            for sy, wy in yw:
                row = sy * src_w
                for sx, wx in xw:
                    w = wy * wx
                    total += w
                    i = (row + sx) * 4
                    a = rgba[i + 3] / 255
                    acc[0] += rgba[i] * a * w
                    acc[1] += rgba[i + 1] * a * w
                    acc[2] += rgba[i + 2] * a * w
                    acc[3] += rgba[i + 3] * w
            o = (oy * out_size + ox) * 4
            alpha = acc[3] / total
            out[o + 3] = int(min(255.0, max(0.0, alpha)) + 0.5)
            if alpha <= 0.5:
                continue
            scale_back = 255 / (alpha * total)
            for c in range(3):
                out[o + c] = int(min(255.0, max(0.0, acc[c] * scale_back)) + 0.5)
    return out


def write_png_rgba(path: Path, size: int, rgba: bytearray) -> None:
    raw = bytearray()
    stride = size * 4
    for y in range(size):
        raw.append(0)
        raw.extend(rgba[y * stride : (y + 1) * stride])

    def chunk(ctype: bytes, body: bytes) -> bytes:
        return (
            struct.pack(">I", len(body))
            + ctype
            + body
            + struct.pack(">I", zlib.crc32(ctype + body) & 0xFFFFFFFF)
        )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def write_cut_out(
    path: Path, rgb: bytearray, width: int, height: int, stroke: tuple[int, int, int]
) -> None:
    full = build_cut_out(rgb, width, height, stroke)
    min_x, min_y, max_x, max_y = alpha_bbox(full, width, height)
    side = max(max_x - min_x, max_y - min_y)
    side = min(int(side * (1 + 2 * ALPHA_PAD)), width, height)
    cx, cy = (min_x + max_x) // 2, (min_y + max_y) // 2
    x0 = max(0, min(width - side, cx - side // 2))
    y0 = max(0, min(height - side, cy - side // 2))
    write_png_rgba(path, 512, resample_rgba(full, width, height, x0, y0, side, 512))


def write_ico(path: Path, png_bytes: bytes, size: int) -> None:
    """A single-image PNG-in-ICO container (supported everywhere modern)."""
    dimension = 0 if size == 256 else size  # 0 encodes 256 in ICO
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack(
        "<BBBBHHII", dimension, dimension, 0, 0, 1, 32, len(png_bytes), 22
    )
    path.write_bytes(header + entry + png_bytes)


def main() -> None:
    width, height, rgb = read_png(SOURCE)
    toned = extract_mark(rgb, width, height)
    composited = screen_blend(toned, FOREST)
    x0, y0, window = square_crop_bounds(
        mark_bbox(width, height, toned), width, height
    )

    mark512 = resample_rgb(composited, width, height, x0, y0, window, 512)
    write_png(MARK, 512, 512, mark512)
    APP_ICON.write_bytes(MARK.read_bytes())

    mark256 = resample_rgb(composited, width, height, x0, y0, window, 256)
    tmp = MARK.parent / "_favicon-256.png"
    write_png(tmp, 256, 256, mark256)
    write_ico(FAVICON, tmp.read_bytes(), 256)
    tmp.unlink()

    # The cut-outs the UI uses: one per surface, because a white ensō is
    # invisible on cream and a forest one is invisible on forest.
    write_cut_out(MARK_ON_DARK, rgb, width, height, CREAM)
    write_cut_out(MARK_ON_LIGHT, rgb, width, height, FOREST)

    print(f"crop: {window}px window at ({x0},{y0}) of {width}×{height}")
    for output in (MARK, MARK_ON_DARK, MARK_ON_LIGHT, APP_ICON, FAVICON):
        print(f"wrote {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
