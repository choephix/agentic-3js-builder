Cause: nullable `tip`/`bone` handles were passed where the SDK requires definite joint references, and `Chain` exposes its path as `.path` rather than providing `.slice()` directly.

```text
<<<<<<< SEARCH
    parent: neck.tip,
=======
    parent: neck.tip!,
>>>>>>> REPLACE

<<<<<<< SEARCH
      { parent: legL.tip, names: ["toeLfront", "toeLfrontTip"], role: "digit" },
=======
      { parent: legL.tip!, names: ["toeLfront", "toeLfrontTip"], role: "digit" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { parent: legL.tip, names: ["toeLside", "toeLsideTip"], role: "digit" },
=======
      { parent: legL.tip!, names: ["toeLside", "toeLsideTip"], role: "digit" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { parent: legL.tip, names: ["toeLback", "toeLbackTip"], role: "digit" },
=======
      { parent: legL.tip!, names: ["toeLback", "toeLbackTip"], role: "digit" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { parent: legR.tip, names: ["toeRfront", "toeRfrontTip"], role: "digit" },
=======
      { parent: legR.tip!, names: ["toeRfront", "toeRfrontTip"], role: "digit" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { parent: legR.tip, names: ["toeRside", "toeRsideTip"], role: "digit" },
=======
      { parent: legR.tip!, names: ["toeRside", "toeRsideTip"], role: "digit" },
>>>>>>> REPLACE

<<<<<<< SEARCH
      { parent: legR.tip, names: ["toeRback", "toeRbackTip"], role: "digit" },
=======
      { parent: legR.tip!, names: ["toeRback", "toeRbackTip"], role: "digit" },
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: leg.tip,
        at: leg.tip.at,
=======
        bone: leg.tip!,
        at: leg.tip!.at,
>>>>>>> REPLACE

<<<<<<< SEARCH
      wing.slice(0, 0.82),
=======
      wing.path.slice(0, 0.82),
>>>>>>> REPLACE

<<<<<<< SEARCH
        bone: wing.tip,
        at: wing.tip.at,
=======
        bone: wing.tip!,
        at: wing.tip!.at,
>>>>>>> REPLACE
```