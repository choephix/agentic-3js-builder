```ts
// Cause: nullable chain tips were passed where JointRefs are required, one membrane/placement call used an invalid inferred frame type, the tail surface query used the wrong overload, and both wing chains reused the same joint names.

<<<<<<< SEARCH
  const neck = spine.tip;
=======
  const neck = spine.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
=======
        bone: leg.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.sweep([paw, toe], [0.028, 0.008], { bone: leg.tip, color: CREAM, caps: "point", name: "claw" });
=======
      b.sweep([paw, toe], [0.028, 0.008], { bone: leg.tip!, color: CREAM, caps: "point", name: "claw" });
>>>>>>> REPLACE

<<<<<<< SEARCH
        names: ["wingBase", "wingElbow", "wingTip"] });
=======
        names: [`wingBase${side > 0 ? "L" : "R"}`, `wingElbow${side > 0 ? "L" : "R"}`, `wingTip${side > 0 ? "L" : "R"}`] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const root = tail.at(0.82).at;
=======
    const root = tail.at(0.82).at;
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: tail.tip, color: s > 0 ? GOLD : MAGENTA, caps: "point", name: "tailFanFeather" });
=======
        bone: tail.tip!, color: s > 0 ? GOLD : MAGENTA, caps: "point", name: "tailFanFeather" });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const p = body.at(t, 0);
=======
    const p = body.at(t);
>>>>>>> REPLACE
```