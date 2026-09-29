// Experiment rounds, `experiments/<id>/round.json`, and the samples they own. A round's samples live in samples/ so
// `npm run snap`, typecheck and provenance handle them like any other, but they belong to the round page
// (round.html): the showcase's sample list and Builds table leave them out.

export type Arm = {
  id: string;
  letter: string;
  name: string;
  /** The builder's subagent name; its log is `<logDir>/<agent>.jsonl`. */
  agent: string;
  /** Arm guide, relative to the round folder. */
  guide: string;
  /** Repo-relative toolkit module, or null for the control arm. */
  toolkit: string | null;
  idea: string;
};
export type Subject = { id: string; name: string; summary: string };
export type Round = {
  id: string;
  title: string;
  question: string;
  started: string;
  model: string;
  modelId: string;
  /** Shared brief, relative to the round folder. */
  brief: string;
  /** The builders' session folder, relative to the home directory. */
  logDir: string;
  subjects: Subject[];
  arms: Arm[];
};

export const manifests = import.meta.glob<Round>("../experiments/*/round.json", { eager: true, import: "default" });

/** A subject's sample in one arm: `lifeguard` + `sculpt` → `lifeguardSculpt`. */
export const slugOf = (subject: Subject, arm: Arm) => `${subject.id}${arm.id[0].toUpperCase()}${arm.id.slice(1)}`;
/** The throwaway sample an arm proves its toolkit on. */
export const testSlug = (arm: Arm) => `${arm.id}Test`;

/** Every sample slug any round owns. */
export const roundSlugs = new Set(
  Object.values(manifests).flatMap((round) =>
    round.arms.flatMap((arm) => [...round.subjects.map((subject) => slugOf(subject, arm)), testSlug(arm)]),
  ),
);
