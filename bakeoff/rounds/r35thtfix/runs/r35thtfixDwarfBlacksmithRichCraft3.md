Cause: the `heel` part has an unterminated template-literal interpolation, so the parser treats the remainder of the module as malformed.

```text
<<<<<<< SEARCH
    box(b, [0.175, 0.065, 0.045], BRASS, [foot[0], 0.09, -0.025], leg.tip, `${side > 0 ? "heelL" : "heelR"`);
=======
    box(b, [0.175, 0.065, 0.045], BRASS, [foot[0], 0.09, -0.025], leg.tip, `${side > 0 ? "heelL" : "heelR"}`);
>>>>>>> REPLACE
```