Cause: `spine.tip` can be null when no tip joint is created, `leg.chain.tip` needs narrowing, and `b.surface` requires built geometry rather than a `Chain`.

```ts
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const end = leg.chain.tip.at;
=======
    const tip = leg.chain.tip!;
    const end = tip.at;
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.chain.tip,
=======
        bone: tip,
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.sweep(spine, (t) => 0.23 + 0.025 * Math.sin(t * Math.PI), {
=======
  const body = b.sweep(spine, (t) => 0.23 + 0.025 * Math.sin(t * Math.PI), {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodySurface = b.surface(spine);
=======
  const bodySurface = b.surface(body);
>>>>>>> REPLACE
```