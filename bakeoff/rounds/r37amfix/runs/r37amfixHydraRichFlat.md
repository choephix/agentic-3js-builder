Cause: `necksLength` is not part of the neck data type; use the chain’s final joint when `tip` is unavailable.

```text
<<<<<<< SEARCH
    const neckTip = necks[n.id].tip ?? necks[n.id].joints[n.necksLength ?? 0];
=======
    const neckTip =
      necks[n.id].tip ??
      necks[n.id].joints[necks[n.id].joints.length - 1];
>>>>>>> REPLACE
```