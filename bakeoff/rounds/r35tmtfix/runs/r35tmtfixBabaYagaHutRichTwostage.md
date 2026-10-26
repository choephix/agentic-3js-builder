```ts
// Cause: three paint constants were referenced before being defined, and `t` was used outside the sweep radius callback; define the constants and make the sweep color callback receive `t`.

<<<<<<< SEARCH
export const meta = {
=======
const CABIN_PAINT = PALETTE.WOOD;
const DOOR_PAINT = PALETTE.WOOD_DARK;
const ROOF_PAINT = PALETTE.ROOF;

export const meta = {
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(leg, (t) => 0.105 - t * 0.025, {
      color: t < 0.45 ? PALETTE.LEG : PALETTE.LEG_DARK,
=======
    b.sweep(leg, (t) => 0.105 - t * 0.025, {
      color: (t) => (t < 0.45 ? PALETTE.LEG : PALETTE.LEG_DARK),
>>>>>>> REPLACE
```