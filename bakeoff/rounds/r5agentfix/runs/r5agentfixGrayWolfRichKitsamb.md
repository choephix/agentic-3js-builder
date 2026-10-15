Cause: `b.cards` was given a Paint (`coat`, `tailPaint`, `maneDark`, `face`) as `color`, but the card material code expects a tint string and calls `.toLowerCase()` on it.

The fix wraps `b.cards` so that each of those paints is swapped for a matching flat tint string.

<<<<<<< SEARCH
  const b = createBuilder({ name: "grayWolf" });
=======
  const b = createBuilder({ name: "grayWolf" });

  // Cards take a tint string; map each coat paint to a representative flat tint.
  const CARD_TINTS = new Map<unknown, string>([
    [coat, "#8a8c92"],
    [tailPaint, "#6c6d74"],
    [maneDark, "#44474f"],
    [face, "#98948a"],
  ]);
  const rawCards = b.cards.bind(b) as (...a: any[]) => any;
  (b as any).cards = (frames: any, tex: any, opts: any) => {
    if (opts && typeof opts.color !== "string" && opts.color !== undefined) {
      opts = { ...opts, color: CARD_TINTS.get(opts.color) ?? "#8a8c92" };
    }
    return rawCards(frames, tex, opts);
  };
>>>>>>> REPLACE