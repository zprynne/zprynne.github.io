/* =========================================================================
   PIXEL-ART SPRITES
   Each sprite is DATA, not drawing code: a grid of characters where every
   character maps to a palette color ('.' = transparent). This is a classic
   data-driven design — to change the art you edit the string map, never the
   renderer. It's the same separation game consoles used: sprite sheets
   (data) fed to a blitter (code).

   The renderer draws ONE canvas pixel per grid cell, so a 16x16 sprite is a
   genuine 16x16 image. CSS then scales it up ~8x, and `image-rendering:
   pixelated` (see styles.css) tells the browser to use nearest-neighbor
   scaling instead of smoothing — that's what keeps the edges blocky and
   sharp instead of blurry.
   ========================================================================= */
(function () {
  "use strict";

  const SPRITES = {
    // Sleeping cat: closed eyes (the KK dashes) + accent-colored z's.
    cat: {
      palette: {
        K: "#10141a", // outline
        O: "#e8a33d", // orange coat
        D: "#c77f2a", // darker stripes
        P: "#e77c8e", // nose
        Z: "#64ffda", // the z's — matches the site accent
      },
      rows: [
        "............ZZZZ",
        "..............Z.",
        ".............Z..",
        "............ZZZZ",
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
      ],
    },

    // Shiba-style dog: tan coat, cream muzzle/chest, tongue out.
    dog: {
      palette: {
        K: "#10141a", // outline
        B: "#c98643", // tan coat
        W: "#f2e3c6", // cream muzzle + chest
        N: "#1b1f24", // nose
        P: "#e77c8e", // tongue
      },
      rows: [
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
      ],
    },

    // Tux: dark slate instead of pure black so the silhouette still reads
    // against the dark panel behind it.
    tux: {
      palette: {
        K: "#2b3240", // body
        W: "#f0f4f8", // belly + eyes
        O: "#f6a821", // beak + feet
      },
      rows: [
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
      ],
    },
  };

  // Draw a sprite at its NATIVE resolution (1 canvas pixel per cell).
  // All scaling is left to CSS — keeping "image data" and "display size"
  // separate is the same idea as the devicePixelRatio handling elsewhere.
  function drawSprite(canvas, sprite) {
    canvas.width = sprite.rows[0].length;
    canvas.height = sprite.rows.length;
    const ctx = canvas.getContext("2d");

    sprite.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const color = sprite.palette[row[x]];
        if (!color) continue; // '.' or unknown char = leave transparent
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  }

  // Wire up every <canvas data-sprite="..."> on the page.
  document.querySelectorAll("canvas[data-sprite]").forEach((canvas) => {
    const sprite = SPRITES[canvas.dataset.sprite];
    if (sprite) drawSprite(canvas, sprite);
  });
})();
