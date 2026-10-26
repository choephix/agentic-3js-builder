Cause: the palette constants were typed and passed as `Rgb` arrays, but this SDK build accepts only colour strings or `Paint` values for `Fill`.

```text
<<<<<<< SEARCH
export const BLACK: Rgb = [0.035, 0.031, 0.09];
export const INK: Rgb = [0.086, 0.051, 0.176];
export const NAVY: Rgb = [0.071, 0.078, 0.255];
export const PURPLE: Rgb = [0.188, 0.125, 0.373];
export const VIOLET: Rgb = [0.412, 0.188, 0.659];
export const MAGENTA: Rgb = [1, 0.012, 0.498];
export const PINK: Rgb = [1, 0.118, 0.71];
export const CYAN: Rgb = [0.008, 0.906, 1];
export const BLUE: Rgb = [0.024, 0.475, 1];
export const LILAC: Rgb = [0.663, 0.529, 1];
export const SILVER: Rgb = [0.365, 0.416, 0.686];
export const CREAM: Rgb = [0.929, 0.804, 0.588];
export const GOLD: Rgb = [1, 0.471, 0.051];
export const RED: Rgb = [1, 0.031, 0.114];
=======
export const BLACK = "#090817";
export const INK = "#160d2d";
export const NAVY = "#121440";
export const PURPLE = "#30205f";
export const VIOLET = "#6930a8";
export const MAGENTA = "#ff037f";
export const PINK = "#ff1eb5";
export const CYAN = "#02e7ff";
export const BLUE = "#066fff";
export const LILAC = "#a987ff";
export const SILVER = "#5d6aae";
export const CREAM = "#edcd96";
export const GOLD = "#ff780d";
export const RED = "#ff081d";
>>>>>>> REPLACE
```