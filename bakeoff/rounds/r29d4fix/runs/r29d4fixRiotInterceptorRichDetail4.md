The leftover placeholder `b.sweep(...)` for a hose was passed `undefined` as its path (`b.chain ? ... && undefined : undefined`), so `toPath` crashed. I replaced it with a real hose swept along a catmull path.

<<<<<<< SEARCH
  const hose = b.sweep(
    b.chain ? ({ at: (t: number) => t } as any) && (undefined as any) : undefined as any,
    0.05,
  ) as any;
  void hose;
=======
  b.sweep(
    [[0.3, 3.1, -2.1], [0.9, 2.6, -2.7], [1.0, 1.9, -2.75], [0.5, 1.6, -2.6]],
    0.05,
    { bone: ch, color: DARK, sides: 6 },
  );
>>>>>>> REPLACE