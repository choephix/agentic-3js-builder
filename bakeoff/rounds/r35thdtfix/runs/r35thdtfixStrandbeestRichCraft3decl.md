Cause: the body sweep passed its radius as a separate function argument, which makes overload resolution ambiguous; provide the radius through the SDK’s `WithRadius<SweepOptions>` object form.

<<<<<<< SEARCH
  const thorax = b.sweep(spine, (t) => 0.145 - 0.018 * t, {
    color: PVC,
=======
  const thorax = b.sweep(spine, {
    radius: (t) => 0.145 - 0.018 * t,
    color: PVC,
>>>>>>> REPLACE