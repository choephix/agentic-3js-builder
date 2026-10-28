Cause: `lerp3` and `wr.map` produce plain number arrays, but `lerp` and `head.local` return `Vector3`, and the code treats those Vector3 results as `number[]` where the `feather` helper takes `number[]`. The fix is to convert the Vector3 values to arrays with `.toArray()`.

Line 83 is the crest feather call that passes `head.local(...)` (a Vector3) as `at: number[]`. Lines 87 and 91 are the same pattern in the head crest loops.

<<<<<<< SEARCH
      feather(head.local({ back: 0.02 + k * 0.03, up: 0.09 }), [s * 0.2 * (k + 1) * 0.3, 0.35 - k * 0.1, -1], 0.3 - k * 0.04, 0.03, head, 0.01);
=======
      feather(head.local({ back: 0.02 + k * 0.03, up: 0.09 }).toArray(), [s * 0.2 * (k + 1) * 0.3, 0.35 - k * 0.1, -1], 0.3 - k * 0.04, 0.03, head, 0.01);
>>>>>>> REPLACE

<<<<<<< SEARCH
  for (const k of [0, 1, 2]) feather(head.local({ back: 0.0 + k * 0.04, up: 0.1 }), [0, 0.5 - k * 0.12, -1], 0.34 - k * 0.05, 0.035, head, 0.012);
=======
  for (const k of [0, 1, 2]) feather(head.local({ back: 0.0 + k * 0.04, up: 0.1 }).toArray(), [0, 0.5 - k * 0.12, -1], 0.34 - k * 0.05, 0.035, head, 0.012);
>>>>>>> REPLACE