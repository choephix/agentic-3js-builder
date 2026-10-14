// Shared by the assemble pages (assemble.ts, assemble-loading.ts, the build worker and the bake lab): the model
// list and the page state in the URL. Recording a build is `src/record.ts`; playing it back, `src/reveal.ts`.
import type { Object3D } from "three";

// ── The models ────────────────────────────────────────────────────────────────────────────────────────────────────

export type SampleModule = { default: () => Object3D; meta?: { name?: string; builtBy?: string } };

export const modules = import.meta.glob<SampleModule>([
  "../samples/mimicHermitCrab.ts",
  "../samples/scarecrow.ts",
  "../samples/highlandCow.ts",
  "../samples/juniperBonsai.ts",
  "../samples/griffin.ts",
  "../samples/triceratops.ts",
  "../samples/sailfish.ts",
  "../samples/vikingLongship.ts",
  "../samples/treehouseDiorama.ts",
  "../samples/steamLocomotive.ts",
  "../samples/stagBeetle.ts",
  "../samples/mossStoneGolem.ts",
  "../samples/dromedaryCaravan.ts",
  "../samples/koiPondIsland.ts",
  "../samples/hamsterRover.ts",
  "../samples/cloudSheep.ts",
  "../samples/mushroomVillage.ts",
  "../samples/blacksmithForgeSonnet.ts",
  "../samples/orcBerserkerSonnet.ts",
  "../samples/redLionfishSonnet.ts",
  "../samples/clockworkAutomaton.ts",
  "../samples/clockworkCarousel.ts",
  "../samples/wanderingMerchant.ts",
  "../samples/warthogSonnet.ts",
  "../samples/littleLich.ts",
  "../samples/jrpgCockatrice.ts",
  "../samples/jadeSerpent.ts",
  "../samples/tinToyDragon.ts",
  "../samples/dosBasilisk.ts",
  "../samples/pixelMammoth.ts",
  "../samples/ps1CaveSpider.ts",
  "../samples/bunnyBakeryIsland.ts",
  "../samples/porcelainElephant.ts",
  "../samples/stainedGlassMoth.ts",
  "../samples/clockworkOwl.ts",
  "../samples/artDecoFalcon.ts",
  "../samples/neonScorpion.ts",
  "../samples/ps1Raptor.ts",
  "../samples/tinToyCrab.ts",
  "../samples/paperDragonKite.ts",
  "../samples/oreBeetle.ts",
  "../samples/flowerHedgehog.ts",
  "../samples/goldenPheasant.ts",
]);

export const MODELS: Array<[string, string]> = [
  ["Mimic hermit crab", "mimicHermitCrab"],
  ["Scarecrow", "scarecrow"],
  ["Highland cow", "highlandCow"],
  ["Bonsai tree", "juniperBonsai"],
  ["Griffin", "griffin"],
  ["Triceratops", "triceratops"],
  ["Sailfish", "sailfish"],
  ["Viking longship", "vikingLongship"],
  ["Treehouse diorama", "treehouseDiorama"],
  ["Steam locomotive", "steamLocomotive"],
  ["Stag beetle", "stagBeetle"],
  ["Moss stone golem", "mossStoneGolem"],
  ["Camel caravan", "dromedaryCaravan"],
  ["Koi pond island", "koiPondIsland"],
  ["Hamster rover", "hamsterRover"],
  ["Cloud sheep", "cloudSheep"],
  ["Mushroom village", "mushroomVillage"],
  ["Blacksmith's forge", "blacksmithForgeSonnet"],
  ["Orc berserker", "orcBerserkerSonnet"],
  ["Red lionfish", "redLionfishSonnet"],
  ["Clockwork automaton", "clockworkAutomaton"],
  ["Clockwork carousel", "clockworkCarousel"],
  ["Wandering merchant", "wanderingMerchant"],
  ["Warthog", "warthogSonnet"],
  ["Little lich", "littleLich"],
  ["Cockatrice", "jrpgCockatrice"],
  ["Jade feathered serpent", "jadeSerpent"],
  ["Tin toy dragon", "tinToyDragon"],
  ["DOS basilisk", "dosBasilisk"],
  ["Pixel mammoth", "pixelMammoth"],
  ["Cave spider", "ps1CaveSpider"],
  ["Bunny bakery island", "bunnyBakeryIsland"],
  ["Porcelain elephant", "porcelainElephant"],
  ["Stained glass moth", "stainedGlassMoth"],
  ["Clockwork owl", "clockworkOwl"],
  ["Art deco falcon", "artDecoFalcon"],
  ["Neon scorpion", "neonScorpion"],
  ["Raptor", "ps1Raptor"],
  ["Tin toy crab", "tinToyCrab"],
  ["Paper dragon kite", "paperDragonKite"],
  ["Ore beetle", "oreBeetle"],
  ["Flower hedgehog", "flowerHedgehog"],
  ["Golden pheasant", "goldenPheasant"],
];

// ── Page state in the URL ─────────────────────────────────────────────────────────────────────────────────────────

/** The hash is `#<model>&key=value…`: the model first, then every setting that differs from its default. */
export function readHash() {
  const [model = "", ...rest] = location.hash.slice(1).split("&");
  return { model: decodeURIComponent(model), params: new URLSearchParams(rest.join("&")) };
}

export function hashOf(model: string, settings: Record<string, string>, defaults: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(settings)) if (value !== defaults[key]) params.set(key, value);
  const query = params.toString();
  return `#${encodeURIComponent(model)}${query ? `&${query}` : ""}`;
}
