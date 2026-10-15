The roof outline's last point is x = 1.4000000000000004, so `1 - |x|/1.4` in `rTop` is slightly negative and raising it to 1.6 gives NaN. The NaN y then fails the outline check.

<<<<<<< SEARCH
  const rTop = (x: number) => 0.1 + 0.52 * (1 - Math.abs(x) / 1.4) ** 1.6 + 0.1 * (Math.abs(x) / 1.4) ** 5;
=======
  const rTop = (x: number) => 0.1 + 0.52 * Math.max(0, 1 - Math.abs(x) / 1.4) ** 1.6 + 0.1 * (Math.abs(x) / 1.4) ** 5;
>>>>>>> REPLACE