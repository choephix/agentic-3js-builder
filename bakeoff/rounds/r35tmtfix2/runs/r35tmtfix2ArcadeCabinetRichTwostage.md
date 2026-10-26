Cause: the SDK’s `b.part` rotation option expects a comma-separated rotation string, not a numeric array.

```ts
<<<<<<< SEARCH
  const deckTilt: [number, number, number] = [8, 0, 0];
=======
  const deckTilt = "8,0,0";
>>>>>>> REPLACE

<<<<<<< SEARCH
      rotation: [8, 0, 0],
=======
      rotation: deckTilt,
>>>>>>> REPLACE
```