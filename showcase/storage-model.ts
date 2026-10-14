// Raw local file measurements, shared by the storage-study page and its build-time data collector.
export type StorageRow = {
  slug: string;
  sourceBytes: number;
  glbBytes: number;
  glbArm: "A" | "B";
  glbName: string;
  sourceModifiedAt: string;
  glbModifiedAt: string;
};

export type StorageStudy = {
  measuredAt: string;
  sampleCount: number;
  rows: StorageRow[];
  unmatched: string[];
};
