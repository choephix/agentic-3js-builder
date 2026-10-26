Cause: the local primitive helpers restrict colours to `string`, while the SDK accepts `ColorInput` (including `Paint`); widen those helper parameters.

```ts
<<<<<<< SEARCH
    color: string,
    options: { bevel?: number; rotation?: [number, number, number] } = {},
=======
    color: ColorInput,
    options: { bevel?: number; rotation?: [number, number, number] } = {},
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
    dir: [number, number, number] = [0, 1, 0],
=======
    color: ColorInput,
    dir: [number, number, number] = [0, 1, 0],
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
  ) => {
=======
    color: ColorInput,
  ) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
    color: string,
  ) => box(name, size, at, color, { bevel: 0.015 });
=======
    color: ColorInput,
  ) => box(name, size, at, color, { bevel: 0.015 });
>>>>>>> REPLACE
```