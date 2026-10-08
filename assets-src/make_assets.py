#!/usr/bin/env python3
"""Draws every image in assets/ for the site.

Each asset is DATA plus a little drawing code: sprites are character maps
('.' = transparent, every other character is a palette key), and text badges
are rendered with the classic web core fonts, aliased so the edges stay hard
like a real 90s GIF. Edit a map or a label here and re-run:

    python3 -m venv .venv && .venv/bin/pip install pillow
    .venv/bin/python assets-src/make_assets.py

Needs Pillow, and the fonts in /System/Library/Fonts/Supplemental (macOS).
Animated assets also get a still .png twin, which the site shows to visitors
who have "reduce motion" turned on.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets"
FONTS = Path("/System/Library/Fonts/Supplemental")


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


# ---------------------------------------------------------------------------
# GIF writing. Every asset uses a small fixed palette, so instead of letting
# a quantizer guess, we collect the exact colors and build the palette by
# hand. Index 0 is reserved for transparency.
# ---------------------------------------------------------------------------
def save_gif(name, frames, durations, still=None):
    colors, transparent = {}, False
    for f in frames:
        for r, g, b, a in f.getdata():
            if a < 128:
                transparent = True
            elif (r, g, b) not in colors:
                colors[(r, g, b)] = len(colors) + 1
    if len(colors) > 255:
        raise ValueError(f"{name}: {len(colors)} colors won't fit a GIF palette")

    palette = [0, 0, 0] + [c for rgb in colors for c in rgb]
    palette += [0] * (768 - len(palette))
    indexed = []
    for f in frames:
        p = Image.new("P", f.size)
        p.putpalette(palette)
        p.putdata([colors[(r, g, b)] if a >= 128 else 0 for r, g, b, a in f.getdata()])
        indexed.append(p)

    extra = {"transparency": 0} if transparent else {}
    indexed[0].save(OUT / f"{name}.gif", save_all=True, append_images=indexed[1:],
                    duration=durations, loop=0, disposal=2, optimize=False, **extra)
    if still is not None:
        frames[still].save(OUT / f"{name}.png")


def sprite_image(rows, palette, scale=1):
    im = Image.new("RGBA", (len(rows[0]), len(rows)), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch in palette:
                im.putpixel((x, y), hexrgb(palette[ch]))
    return im.resize((im.width * scale, im.height * scale), Image.NEAREST)


# ---------------------------------------------------------------------------
# Pixel pals: the cat, dog and Tux sprites from the old card design, now
# animated. Same maps as before, with the frame changes listed alongside.
# ---------------------------------------------------------------------------
CAT_PALETTE = {"K": "#10141a", "O": "#e8a33d", "D": "#c77f2a", "P": "#e77c8e", "Z": "#00ffff"}
CAT_BODY = [
    "................",  # blank rows: room for the z's
    "................",
    "................",
    "................",
    "................",
    "................",
    "...K........K...",
    "...KK......KK...",
    "...KOK....KOK...",
    "..KOOKKKKKKOOK..",
    "..KOOOOOOOOOOK..",
    "..KODOOOOOODOK..",
    "..KOKKOOOOKKOK..",
    "..KOOOOPPOOOOK..",
    ".KKOOOOOOOOOOKK.",
    ".KOOOOOOOOOOOOK.",
    ".KODOOOOOOOODOK.",
    "..KKKKKKKKKKKK..",
]
def cells(rows, left, top):
    """(x, y) of every non-'.' cell in a small map, placed at (left, top)."""
    return [(left + x, top + y) for y, row in enumerate(rows) for x, ch in enumerate(row) if ch != "."]


SMALL_Z = cells(["ZZZZ", "..Z.", ".Z..", "ZZZZ"], 7, 2)
BIG_Z = cells(["ZZZZZ", "...Z.", "..Z..", ".Z...", "ZZZZZ"], 11, 0)

DOG_PALETTE = {"K": "#10141a", "B": "#c98643", "W": "#f2e3c6", "N": "#1b1f24", "P": "#e77c8e"}
DOG = [
    "..KKK......KKK..",
    ".KBBBK....KBBBK.",
    ".KBBBKKKKKKBBBK.",
    ".KBBKBBBBBBKBBK.",
    ".KBBKBBWWBBKBBK.",
    "..KKBWWWWWWBKK..",
    "..KBWKWWWWKWBK..",
    "..KWWWWNNWWWWK..",
    "..KWWWKPPKWWWK..",
    "..KWWWWPPWWWWK..",
    "...KKWWWWWWKK...",
    "..KBBWWWWWWBBK..",
    ".KBBBWWWWWWBBBK.",
    ".KBBBWWWWWWBBBK.",
    "..KKKKKKKKKKKK..",
]

TUX_PALETTE = {"K": "#2b3240", "W": "#f0f4f8", "O": "#f6a821"}
TUX = [
    ".....KKKKKK.....",
    "....KKKKKKKK....",
    "....KWWWWWWK....",
    "....KWKWWKWK....",
    "....KKOOOOKK....",
    "...KKOOOOOOKK...",
    "...KKKOOOOKKK...",
    "..KKWWWWWWWWKK..",
    "..KWWWWWWWWWWK..",
    ".KKWWWWWWWWWWKK.",
    ".KWWWWWWWWWWWWK.",
    ".KWWWWWWWWWWWWK.",
    ".KWWWWWWWWWWWWK.",
    "..KWWWWWWWWWWK..",
    ".OOKKWWWWWWKKOO.",
    "OOOO.KKKKKK.OOOO",
]


def with_cells(rows, cells, ch):
    grid = [list(r) for r in rows]
    for x, y in cells:
        grid[y][x] = ch
    return ["".join(r) for r in grid]


def make_pals():
    # Cat: the z's drift in one at a time while it sleeps.
    cat = [CAT_BODY, with_cells(CAT_BODY, SMALL_Z, "Z"),
           with_cells(with_cells(CAT_BODY, SMALL_Z, "Z"), BIG_Z, "Z")]
    save_gif("cat", [sprite_image(r, CAT_PALETTE, 4) for r in cat], [600, 600, 900])

    # Dog: panting, tongue in and out.
    tongue_in = with_cells(DOG, [(7, 9), (8, 9)], "W")
    save_gif("dog", [sprite_image(r, DOG_PALETTE, 4) for r in (DOG, tongue_in)], [260, 260])

    # Tux: a slow blink.
    blink = with_cells(TUX, [(5, 2), (6, 2), (9, 2), (10, 2), (5, 3), (6, 3), (9, 3), (10, 3)], "K")
    save_gif("tux", [sprite_image(r, TUX_PALETTE, 4) for r in (TUX, blink)], [2400, 160])

    # Cat, awake: shown while it wanders the footer (pals.js) and when petted.
    # Same canvas as the sleeping cat, so swapping images doesn't shift it.
    awake = with_cells(CAT_BODY, [(4, 11), (5, 11), (10, 11), (11, 11)], "K")
    sprite_image(awake, CAT_PALETTE, 4).save(OUT / "cat-awake.png")


# ---------------------------------------------------------------------------
# Footer yard: a heart that pops up when a pal is petted, and a grass strip
# for the pals to walk on (tiles across the bottom of the footer).
# ---------------------------------------------------------------------------
HEART = [
    ".RR.RR.",
    "RRRRRRR",
    "RRWRRRR",
    ".RRRRR.",
    "..RRR..",
    "...R...",
]
GRASS = [
    "..L...L.",
    ".LG.L.GL",
    "GGGGGGGG",
    "DGDDGDDG",
]


def make_yard():
    sprite_image(HEART, {"R": "#ff3366", "W": "#ffffff"}, 3).save(OUT / "heart.png")
    sprite_image(GRASS, {"L": "#66ff66", "G": "#22aa22", "D": "#116611"}, 4).save(OUT / "grass.png")


# ---------------------------------------------------------------------------
# Favicon: "ZP" in the heading colors (yellow, magenta drop shadow) on navy,
# written out as crisp SVG squares so it stays sharp at any tab size.
# ---------------------------------------------------------------------------
FAVICON_PALETTE = {"N": "#000080", "Y": "#ffff00", "S": "#cc00cc"}
FAVICON = [
    "NNNNNNNNNNNNNNNN",
    "NNNNNNNNNNNNNNNN",
    "NNNNNNNNNNNNNNNN",
    "NYYYYYYNYYYYYNNN",
    "NYYYYYYSYYYYYYNN",
    "NNSSSYYSYYSSYYSN",
    "NNNNYYSNYYSNYYSN",
    "NNNYYSNNYYYYYYSN",
    "NNYYSNNNYYYYYSSN",
    "NYYSNNNNYYSSSSNN",
    "NYYYYYYNYYSNNNNN",
    "NYYYYYYSYYSNNNNN",
    "NNSSSSSSNSSNNNNN",
    "NNNNNNNNNNNNNNNN",
    "NNNNNNNNNNNNNNNN",
    "NNNNNNNNNNNNNNNN",
]


def make_favicon():
    rects = [f'<rect x="{x}" y="{y}" width="1" height="1" fill="{FAVICON_PALETTE[ch]}"/>'
             for y, row in enumerate(FAVICON) for x, ch in enumerate(row) if ch != "N"]
    (OUT / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">\n'
        f'<rect width="16" height="16" fill="{FAVICON_PALETTE["N"]}"/>\n'
        + "\n".join(rects) + "\n</svg>\n")


# ---------------------------------------------------------------------------
# Starfield: a seamless tile for the page background. A few stars twinkle.
# ---------------------------------------------------------------------------
def make_stars():
    import random
    rnd = random.Random(7)
    size = 256  # big enough that the tile's repeat isn't obvious
    dim = [(rnd.randrange(size), rnd.randrange(size), rnd.choice(["#4a4a5a", "#6a6a80", "#8a8aa0"]))
           for _ in range(200)]
    bright = [(rnd.randrange(size), rnd.randrange(size)) for _ in range(28)]
    sparkles = [(rnd.randrange(size), rnd.randrange(size)) for _ in range(4)]

    frames = []
    for f in range(4):
        im = Image.new("RGBA", (size, size), hexrgb("#000000"))
        for x, y, c in dim:
            im.putpixel((x, y), hexrgb(c))
        for i, (x, y) in enumerate(bright):
            on = (i + f) % 4 != 0  # each bright star dims one frame in four
            im.putpixel((x, y), hexrgb("#ffffff" if on else "#5a5a70"))
        # Small, dim crosses: anything brighter makes the tile's grid visible.
        for i, (x, y) in enumerate(sparkles):
            arm = (f + i) % 3  # cross grows, shrinks, vanishes to a point
            for d in range(-arm, arm + 1):
                im.putpixel(((x + d) % size, y), hexrgb("#5a6aa8"))
                im.putpixel((x, (y + d) % size), hexrgb("#5a6aa8"))
            im.putpixel((x, y), hexrgb("#c8d2ff"))
        frames.append(im)
    save_gif("stars", frames, [500] * 4, still=0)


# ---------------------------------------------------------------------------
# Title: WordArt with a 3D extrude and a glint that sweeps across every few
# seconds. Each style's "face" bands run top to bottom across the letters
# ("rainbow" runs left to right instead); "extrude" runs from just behind the
# face back into the 3D edge. Pick one with TITLE_STYLE.
# ---------------------------------------------------------------------------
TITLE_STYLES = {
    "chrome": {
        "face": ["#ffffff", "#e6f0ff", "#c4dbff", "#9cc2ff", "#76a9ff", "#4f86e8",
                 "#1d1d4f",
                 "#6b3a1c", "#91552a", "#b87a3c", "#dba35a", "#f6cf86", "#fff0c4"],
        "extrude": ["#ff4dff", "#d633d6", "#ad1fad", "#850f85", "#5e055e", "#3a003a"],
    },
    "fire": {
        "face": ["#ffffe0", "#ffff99", "#ffff33", "#ffe600", "#ffc400", "#ffa200",
                 "#ff8000", "#ff5e00", "#ff3c00", "#e01e00", "#b80000"],
        "extrude": ["#ff2a00", "#cc1a00", "#991100", "#700a00", "#4a0500", "#2a0200"],
    },
    "matrix": {
        "face": ["#eaffea", "#bfffbf", "#8cff8c", "#59ff59", "#26ff26", "#00f000",
                 "#00d400", "#00b800", "#009c00"],
        "extrude": ["#00a84a", "#008a3c", "#006b2e", "#004d21", "#003316", "#001a0b"],
    },
    "synthwave": {
        "face": ["#ffe0f7", "#ffaaeb", "#ff73dc", "#ff3dcc", "#e600b8",
                 "#3a0066",
                 "#ff6a00", "#ff8c1a", "#ffad33", "#ffcc55", "#ffe680"],
        "extrude": ["#00ffff", "#00cfcf", "#00a0a0", "#007474", "#004c4c", "#002828"],
    },
    "rainbow": {
        "face": "rainbow",
        "extrude": ["#b44dff", "#8f2ee0", "#6c1ab8", "#4d0d8c", "#330660", "#1c0236"],
    },
}
TITLE_STYLE = "matrix"


def make_title(style=TITLE_STYLE):
    colors = TITLE_STYLES[style]
    extrude = colors["extrude"]
    f = font("Arial Black.ttf", 44)
    text = "Zach's Home Page"
    left, top, right, bottom = f.getbbox(text)
    pad, depth = 3, len(extrude)
    mw, mh = right - left + pad * 2, bottom - top + pad * 2

    face = Image.new("L", (mw, mh), 0)
    d = ImageDraw.Draw(face)
    d.fontmode = "1"
    d.text((pad - left, pad - top), text, font=f, fill=255)
    outline = face.filter(ImageFilter.MaxFilter(3))

    band = Image.new("RGBA", (mw, mh))
    if colors["face"] == "rainbow":
        # 24 stepped hues, 8px each, so it reads as chunky GIF color bands.
        import colorsys
        for x in range(mw):
            r, g, b = colorsys.hsv_to_rgb((x // 8 % 24) / 24, 0.85, 1.0)
            band.paste((round(r * 255), round(g * 255), round(b * 255), 255), (x, 0, x + 1, mh))
    else:
        face_colors = colors["face"]
        for y in range(mh):
            t = min(max((y - pad) / (bottom - top), 0), 0.999)
            band.paste(hexrgb(face_colors[int(t * len(face_colors))]), (0, y, mw, y + 1))

    def frame(glint_x=None):
        im = Image.new("RGBA", (mw + depth, mh + depth), (0, 0, 0, 0))
        for i in range(depth, 0, -1):
            im.paste(hexrgb(extrude[i - 1]), (i, i, i + mw, i + mh), outline)
        im.paste(hexrgb("#000000"), (0, 0, mw, mh), outline)
        im.paste(band, (0, 0, mw, mh), face)
        if glint_x is not None:
            glint = Image.new("L", (mw, mh), 0)
            gd = ImageDraw.Draw(glint)
            gd.polygon([(glint_x, 0), (glint_x + 8, 0), (glint_x + 8 - mh, mh), (glint_x - mh, mh)], fill=255)
            hit = Image.new("L", (mw, mh), 0)
            hit.paste(glint, (0, 0), face)
            im.paste(hexrgb("#ffffff"), (0, 0, mw, mh), hit)
        return im

    sweep = list(range(0, mw + mh, 24))
    frames = [frame()] + [frame(x) for x in sweep]
    save_gif("title", frames, [2600] + [40] * len(sweep), still=0)


# ---------------------------------------------------------------------------
# Small animated badges.
# ---------------------------------------------------------------------------
def make_new():
    f = font("Verdana Bold.ttf", 10)
    frames = []
    for bg, fg in (("#ff0000", "#ffff00"), ("#ffff00", "#ff0000")):
        im = Image.new("RGBA", (34, 15), hexrgb(bg))
        d = ImageDraw.Draw(im)
        d.fontmode = "1"
        d.rectangle([0, 0, 33, 14], outline=hexrgb("#000000"))
        d.text((17, 8), "NEW!", font=f, fill=hexrgb(fg), anchor="mm")
        frames.append(im)
    save_gif("new", frames, [500, 500], still=0)  # 1 flash a second: safe


CONE = [
    "....O....",
    "...OOO...",
    "...WWW...",
    "..OOOOO..",
    "..WWWWW..",
    ".OOOOOOO.",
    "KKKKKKKKK",
]


def make_construction():
    w, h, stripe = 236, 44, 8
    f = font("Verdana Bold.ttf", 10)
    cone = sprite_image(CONE, {"O": "#ff6a00", "W": "#ffffff", "K": "#333333"}, 2)
    frames = []
    for shift in range(0, 12, 2):
        im = Image.new("RGBA", (w, h), hexrgb("#ffd400"))
        px = im.load()
        for y in list(range(stripe)) + list(range(h - stripe, h)):
            for x in range(w):
                if ((x + y - shift) // 6) % 2 == 0:
                    px[x, y] = hexrgb("#111111")
        d = ImageDraw.Draw(im)
        d.fontmode = "1"
        d.rectangle([0, 0, w - 1, h - 1], outline=hexrgb("#000000"))
        d.text((w // 2, h // 2), "UNDER CONSTRUCTION", font=f, fill=hexrgb("#000000"), anchor="mm")
        im.paste(cone, (12, h // 2 - cone.height // 2), cone)
        im.paste(cone, (w - 12 - cone.width, h // 2 - cone.height // 2), cone)
        frames.append(im)
    save_gif("construction", frames, [100] * len(frames), still=0)


BIT_GLYPHS = {  # 3x5 pixel digits
    "0": ["###", "#.#", "#.#", "#.#", "###"],
    "1": [".#.", "##.", ".#.", ".#.", "###"],
}


def make_bits():
    # A divider of green binary scrolling left, to match the Matrix-green
    # title. Tiles horizontally; digits vary in brightness for some depth.
    import random
    from PIL import ImageChops
    rnd = random.Random(1999)
    count, cell, h = 24, 4, 7  # 3px digit + 1px gap; 1px of black above and below
    shades = ["#d4ffd4", "#4dff4d", "#4dff4d", "#00b300", "#00b300", "#006400"]
    strip = Image.new("RGBA", (count * cell, h), hexrgb("#000000"))
    for i in range(count):
        color = hexrgb(rnd.choice(shades))
        for y, row in enumerate(BIT_GLYPHS[rnd.choice("01")]):
            for x, px in enumerate(row):
                if px == "#":
                    strip.putpixel((i * cell + x, 1 + y), color)
    # offset() wraps around, so every frame still tiles seamlessly.
    frames = [ImageChops.offset(strip, -shift, 0) for shift in range(0, strip.width, 2)]
    save_gif("bits", frames, [60] * len(frames), still=0)


def make_star_bullet():
    frames = []
    for arm, diag in ((1, False), (2, False), (3, True), (2, True)):
        im = Image.new("RGBA", (11, 11), (0, 0, 0, 0))
        c = 5
        for d in range(-arm, arm + 1):
            im.putpixel((c + d, c), hexrgb("#ffff00"))
            im.putpixel((c, c + d), hexrgb("#ffff00"))
        if diag:
            for d in (-1, 1):
                im.putpixel((c + d, c + d), hexrgb("#ffaa00"))
                im.putpixel((c + d, c - d), hexrgb("#ffaa00"))
        im.putpixel((c, c), hexrgb("#ffffff"))
        frames.append(im)
    save_gif("star", frames, [140] * 4)


ENVELOPE = [
    "KKKKKKKKKKKKKKKK",
    "KWKWWWWWWWWWWKWK",
    "KWWKWWWWWWWWKWWK",
    "KWWWKWWWWWWKWWWK",
    "KWWWWKWWWWKWWWWK",
    "KWWWWWKRRKWWWWWK",
    "KWWWWKWRRWKWWWWK",
    "KWWWKWWWWWWKWWWK",
    "KWWKWWWWWWWWKWWK",
    "KWKWWWWWWWWWWKWK",
    "KKKKKKKKKKKKKKKK",
]


def make_email():
    env = sprite_image(ENVELOPE, {"K": "#000000", "W": "#ffffff", "R": "#e00000"}, 2)
    frames = []
    for dy in (0, 3):
        im = Image.new("RGBA", (env.width, env.height + 3), (0, 0, 0, 0))
        im.paste(env, (0, 3 - dy), env)
        frames.append(im)
    save_gif("email", frames, [400, 400])


# ---------------------------------------------------------------------------
# 88x31 buttons. Every claim on them is true of this site.
# ---------------------------------------------------------------------------
GLOBE = [
    "...CCCCC...",
    "..CBCBCBC..",
    ".CBBCBCBBC.",
    "CCCCCCCCCCC",
    "CBBBCBCBBBC",
    "CBBBCBCBBBC",
    "CBBBCBCBBBC",
    "CCCCCCCCCCC",
    ".CBBCBCBBC.",
    "..CBCBCBC..",
    "...CCCCC...",
]
COMPUTER = [
    ".KKKKKKKKK.",
    "KWWWWWWWWWK",
    "KWKKKKKKKWK",
    "KWKBBBBBKWK",
    "KWKBBBBBKWK",
    "KWKBBBBBKWK",
    "KWKKKKKKKWK",
    "KWWWWWWWWWK",
    "KWWWWWKKKWK",
    "KWWWWWWWWWK",
    "KKKKKKKKKKK",
    ".KWWWWWWWK.",
    ".KKKKKKKKK.",
]
LEAF = [
    ".....R.....",
    "....RRR....",
    ".R..RRR..R.",
    ".RR.RRR.RR.",
    "RRRRRRRRRRR",
    ".RRRRRRRRR.",
    "..RRRRRRR..",
    ".RRRRRRRRR.",
    "....RRR....",
    ".....R.....",
    ".....R.....",
]

BUTTONS = [
    # name, lines, background, text, bevel light, bevel dark, icon
    ("btn-anybrowser", ["ANY", "BROWSER"], "#000080", "#ffff00", "#4040ff", "#000040",
     (GLOBE, {"C": "#00ffff", "B": "#0000c0"})),
    ("btn-mac", ["MADE ON", "A MAC"], "#c0c0c0", "#000000", "#ffffff", "#808080",
     (COMPUTER, {"K": "#000000", "W": "#e8e0c8", "B": "#6060c0"})),
    ("btn-notrackers", ["NO TRACKERS", "NO ADS"], "#003300", "#00ff00", "#00aa00", "#001100", None),
    ("btn-latex", ["RESUME", "TYPESET IN LaTeX"], "#ffffff", "#000000", "#ffffff", "#909090", None),
    ("btn-winnipeg", ["MADE IN", "WINNIPEG"], "#ffffff", "#cc0000", "#ffffff", "#a0a0a0",
     (LEAF, {"R": "#dd0000"})),
    ("btn-ghpages", ["HOSTED ON", "GITHUB PAGES"], "#000000", "#ffffff", "#606060", "#202020", None),
]


def make_buttons():
    w, h = 88, 31
    for name, lines, bg, fg, light, dark, icon in BUTTONS:
        im = Image.new("RGBA", (w, h), hexrgb(bg))
        d = ImageDraw.Draw(im)
        d.fontmode = "1"
        d.rectangle([0, 0, w - 1, h - 1], outline=hexrgb("#000000"))
        d.line([(1, 1), (w - 2, 1)], fill=hexrgb(light))
        d.line([(1, 1), (1, h - 2)], fill=hexrgb(light))
        d.line([(1, h - 2), (w - 2, h - 2)], fill=hexrgb(dark))
        d.line([(w - 2, 1), (w - 2, h - 2)], fill=hexrgb(dark))

        x0 = 3
        if icon:
            art = sprite_image(*icon)
            im.paste(art, (5, (h - art.height) // 2), art)
            x0 = 5 + art.width + 2
        room = w - 3 - x0
        for f in (font("Verdana Bold.ttf", 9), font("Verdana.ttf", 9), font("Verdana Bold.ttf", 8)):
            if all(f.getlength(t) <= room for t in lines):
                break
        else:
            raise ValueError(f"{name}: label too wide for an 88x31 button")
        line_h = 11
        y = (h - line_h * len(lines)) // 2 + line_h // 2
        for t in lines:
            d.text((x0 + room / 2, y), t, font=f, fill=hexrgb(fg), anchor="mm")
            y += line_h
        im.save(OUT / f"{name}.png")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    make_pals()
    make_favicon()
    make_yard()
    make_stars()
    make_title()
    make_new()
    make_construction()
    make_bits()
    make_star_bullet()
    make_email()
    make_buttons()
    print("wrote", ", ".join(sorted(p.name for p in OUT.iterdir())))
