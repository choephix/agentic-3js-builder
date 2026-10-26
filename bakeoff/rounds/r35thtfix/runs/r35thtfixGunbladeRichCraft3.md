Cause: `gearL` and `gearR` pass metal paints as tints for textured parts; textured parts require colour strings.

```ts
<<<<<<< SEARCH
  const gearL = b.part(gearGeometry(smallGearShape), BRASS, {
=======
  const gearL = b.part(gearGeometry(smallGearShape), TINT.brass, {
>>>>>>> REPLACE

<<<<<<< SEARCH
  const gearR = b.part(gearGeometry(smallGearShape), OLD_BRASS, {
=======
  const gearR = b.part(gearGeometry(smallGearShape), TINT.bronze, {
>>>>>>> REPLACE
```