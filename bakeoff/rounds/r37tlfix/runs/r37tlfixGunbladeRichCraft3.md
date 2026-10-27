Cause: gear 2’s `angle: -105` places it almost on gear 0, violating the train’s non-meshing clearance check.

```ts
<<<<<<< SEARCH
      { teeth: 14, from: 1, angle: -105, color: GOLD, holes: 5, bore: 0.006 },
=======
      { teeth: 14, from: 1, angle: 60, color: GOLD, holes: 5, bore: 0.006 },
>>>>>>> REPLACE
```