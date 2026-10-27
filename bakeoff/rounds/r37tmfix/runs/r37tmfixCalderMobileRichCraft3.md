Cause: `flat` is not a valid option for `b.rod`; flat shading is not supported by the rod overload.

```text
<<<<<<< SEARCH
    b.rod(a, z, r, { color, caps: "round", section: { ngon: 6 }, flat: true });
=======
    b.rod(a, z, r, { color, caps: "round", section: { ngon: 6 } });
>>>>>>> REPLACE
```