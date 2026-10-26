Cause: `flat` is not a `frustumBox` option, `ChainPoint` values must be passed as `.at`, and the final boot patches referenced an undefined foot bone.

```text
<<<<<<< SEARCH
      skin: "rigid",
      flat: true,
=======
      skin: "rigid",
>>>>>>> REPLACE

<<<<<<< SEARCH
    segment(`upperSleeve${side}`, arm.at(0), arm.at(1), 0.16, 0.18, KRAFT_LIGHT, shoulder);
    segment(`lowerSleeve${side}`, arm.at(1), arm.at(2), 0.145, 0.17, KRAFT, elbow);
=======
    segment(`upperSleeve${side}`, arm.at(0).at, arm.at(1).at, 0.16, 0.18, KRAFT_LIGHT, shoulder);
    segment(`lowerSleeve${side}`, arm.at(1).at, arm.at(2).at, 0.145, 0.17, KRAFT, elbow);
>>>>>>> REPLACE

<<<<<<< SEARCH
    segment(`thighBox${side}`, leg.at(0), leg.at(1), 0.205, 0.20, KRAFT_LIGHT, thighBone);
    segment(`shinBox${side}`, leg.at(1), leg.at(2), 0.18, 0.18, KRAFT, shinBone);
=======
    segment(`thighBox${side}`, leg.at(0).at, leg.at(1).at, 0.205, 0.20, KRAFT_LIGHT, thighBone);
    segment(`shinBox${side}`, leg.at(1).at, leg.at(2).at, 0.18, 0.18, KRAFT, shinBone);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(`bootSidePatch${side}`, [0.018, 0.10, 0.13], [s * 0.335, 0.12, 0.20], TAPE_SHADOW, footBone);
    box(`bootSidePatchEdge${side}`, [0.022, 0.012, 0.14], [s * 0.347, 0.17, 0.20], EDGE, footBone);
=======
    const footBone = s > 0 ? legL.joints[3] : legR.joints[3];
    box(`bootSidePatch${side}`, [0.018, 0.10, 0.13], [s * 0.335, 0.12, 0.20], TAPE_SHADOW, footBone);
    box(`bootSidePatchEdge${side}`, [0.022, 0.012, 0.14], [s * 0.347, 0.17, 0.20], EDGE, footBone);
>>>>>>> REPLACE
```