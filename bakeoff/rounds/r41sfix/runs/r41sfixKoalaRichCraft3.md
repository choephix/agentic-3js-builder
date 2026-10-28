The error is on line 92, the `b.sweep(ac, [0.075, 0.05], { color: FUR })` call on a chain. Counting lines is unreliable, so the likely culprit is line 92's `b.sweep(spine, [0.2, 0.22, 0.2, 0.15], { color: FUR, shift: (_t: number) => [0, 0] })`: the `shift` function returns `number[]`, not the `[x, y]` tuple the SDK expects. Removing the unneeded `shift` fixes it.

<<<<<<< SEARCH
  b.sweep(spine, [0.2, 0.22, 0.2, 0.15], { color: FUR, shift: (_t: number) => [0, 0] });
=======
  b.sweep(spine, [0.2, 0.22, 0.2, 0.15], { color: FUR });
>>>>>>> REPLACE