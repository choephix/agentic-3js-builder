Cause: `t` is only defined as the sweep color callback parameter; it was referenced as an undeclared variable in the options object.

```text
<<<<<<< SEARCH
      color: t < 0.45 ? PALETTE.LEG : PALETTE.LEG_DARK,
=======
      color: (t) => (t < 0.45 ? PALETTE.LEG : PALETTE.LEG_DARK),
>>>>>>> REPLACE
```