The `sleeve` helper's lathe outline is `[0,0] → [0.9r,0] → [r,0.015] → [r,h-0.015] → [0.9r,h] → [0,h]`. When the sleeve height `h` is 0.02 or 0.04 (the gold rings), `h-0.015` falls below `0.015`, so the side edges cross. Clamping the chamfer to a third of `h` fixes it.

<<<<<<< SEARCH
    const h = y1 - y0;
    return b.lathe(
      [
        [0, 0],
        [r * 0.9, 0],
        [r, 0.015],
        [r, h - 0.015],
        [r * 0.9, h],
        [0, h],
      ],
=======
    const h = y1 - y0;
    const c = Math.min(0.015, h / 3);
    return b.lathe(
      [
        [0, 0],
        [r * 0.9, 0],
        [r, c],
        [r, h - c],
        [r * 0.9, h],
        [0, h],
      ],
>>>>>>> REPLACE