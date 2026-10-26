The errors come from overly narrow `string` helper parameters, assigning `Rgb` results into inferred `string` variables, and two grille diagonals collapsing to zero-length rods at their endpoints.

<<<<<<< SEARCH
  type ColorInput,
  createBuilder,
=======
  type ColorInput,
  type Rgb,
  createBuilder,
>>>>>>> REPLACE

<<<<<<< SEARCH
  let color = palette[Math.floor(c.id * palette.length) % palette.length];
=======
  let color: string | Rgb = palette[Math.floor(c.id * palette.length) % palette.length];
>>>>>>> REPLACE

<<<<<<< SEARCH
  let color = palette[Math.floor(c.id * palette.length) % palette.length];
=======
  let color: string | Rgb = palette[Math.floor(c.id * palette.length) % palette.length];
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  at: [number, number, number],
  name: string,
  bevel = 0,
=======
  color: ColorInput,
  at: [number, number, number],
  name: string,
  bevel = 0,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  at: [number, number, number],
  name: string,
  sides = 10,
=======
  color: ColorInput,
  at: [number, number, number],
  name: string,
  sides = 10,
>>>>>>> REPLACE

<<<<<<< SEARCH
  radius: number,
  color: string,
  name: string,
=======
  radius: number,
  color: ColorInput,
  name: string,
>>>>>>> REPLACE

<<<<<<< SEARCH
  color: string,
  name: string,
  r = 0.034,
=======
  color: ColorInput,
  name: string,
  r = 0.034,
>>>>>>> REPLACE

<<<<<<< SEARCH
        rod([x0, y0, zLattice], [x1, y1, zLattice], 0.0065, color, `${prefix}${i}`);
=======
        if (x1 > x0 + 1e-6)
          rod([x0, y0, zLattice], [x1, y1, zLattice], 0.0065, color, `${prefix}${i}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
          rod([sx, sy, zLattice], [ex, ey, zLattice], 0.0065, color, `${prefix}Upper${i}`);
=======
          if (sx > ex + 1e-6)
            rod([sx, sy, zLattice], [ex, ey, zLattice], 0.0065, color, `${prefix}Upper${i}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
        rod([x0, y0, zLattice], [x1, y1, zLattice], 0.0065, color, `${prefix}${i}`);
=======
        if (x1 > x0 + 1e-6)
          rod([x0, y0, zLattice], [x1, y1, zLattice], 0.0065, color, `${prefix}${i}`);
>>>>>>> REPLACE

<<<<<<< SEARCH
          rod([sx, sy, zLattice], [ex, ey, zLattice], 0.0065, color, `${prefix}Lower${i}`);
=======
          if (sx > ex + 1e-6)
            rod([sx, sy, zLattice], [ex, ey, zLattice], 0.0065, color, `${prefix}Lower${i}`);
>>>>>>> REPLACE