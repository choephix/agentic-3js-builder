The errors come from nullable optional-chain bones being passed where a definite `JointRef` is required, plus `glow()` rejecting the painted seed pod; use a definite fallback joint and a flat pod colour.

```ts
<<<<<<< SEARCH
        bone: branch.chain?.tip ?? root,
=======
        bone: branch.chain?.tip || root,
>>>>>>> REPLACE

<<<<<<< SEARCH
      podPaint,
=======
      MAGENTA,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: branch.chain?.tip ?? root,
=======
        bone: branch.chain?.tip || root,
>>>>>>> REPLACE

<<<<<<< SEARCH
      color: CYAN, bone: branch.chain?.tip ?? root, name: `pod-filament${i}` },
=======
      color: CYAN, bone: branch.chain?.tip || root, name: `pod-filament${i}` },
>>>>>>> REPLACE

<<<<<<< SEARCH
      bone: p.bone ?? root,
=======
      bone: p.bone || root,
>>>>>>> REPLACE
```