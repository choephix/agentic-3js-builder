Cause: `arm.tip` is nullable in the SDK, so accessing `.at` requires a non-null assertion.

<<<<<<< SEARCH
    const fingers: any[] = [];
    const wrist = arm.tip.at;
    const fingerData = [
=======
    const fingers: any[] = [];
    const wrist = arm.tip!.at;
    const fingerData = [
>>>>>>> REPLACE