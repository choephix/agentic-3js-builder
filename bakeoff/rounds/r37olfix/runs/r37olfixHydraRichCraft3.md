The errors come from nullable `Chain.tip`/`Joint` handles being passed where the SDK requires a definite joint; assert their existence with `!`.

```text
<<<<<<< SEARCH
    parent: spine.tip,
=======
    parent: spine.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      parent: neck.tip,
=======
      parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tip = leg.tip;
=======
    const tip = leg.tip!;
>>>>>>> REPLACE

<<<<<<< SEARCH
      { bone: tip, at: tip.at, name: `paw${li}` },
=======
      { bone: tip!, at: tip.at, name: `paw${li}` },
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: tip,
=======
        bone: tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: spine.tip,
=======
        bone: spine.tip!,
>>>>>>> REPLACE