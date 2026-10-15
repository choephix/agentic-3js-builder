#!/usr/bin/env python3
"""Regenerate the API-builder comparison: python3 bakeoff/gap_page.py.

The archived columns retain the exact per-subject snaps and existing judge
captions from the original page. New columns read live round results/checks.
This script never calls models, judges builds, or renders samples.
"""

import html
import json
import re
import tempfile
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUNDS = ROOT / "bakeoff/rounds"
PUBLIC = Path.home() / "tmp/public/nilo/agentic-3js-builder"
SNAPS = PUBLIC / "snaps"
OUTPUT = PUBLIC / "gap/index.html"

# Exact archive mapping recovered from the previous gap/index.html.
LEGACY = {
    'africanElephant': {'sonnet-agent': {'prefix': '../snaps/africanElephantSonnet/B/snaps/v02', 'meta': '$1.99 · 10 min', 'judge': 'gpt 6.0 gemini 6.0 claude 5.0'}, 'agent-draft': {'prefix': '../snaps/r7agentfixAfricanElephantRichCraft/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7fixAfricanElephantRichCraft/B/snaps/v01', 'meta': '$0.62 · 7 min', 'judge': 'gpt 6.5 gemini 6.5 claude 7.5'}, 'sonnet-two': {'prefix': '../snaps/r7c2AfricanElephantRichCraft/B/snaps/v01', 'meta': '$0.79 · 8 min', 'judge': 'gpt 8.0 gemini 6.5 claude 8.0'}, 'sol-one': {'prefix': '../snaps/r7solAfricanElephantRichCraft2/B/snaps/v01', 'meta': '$0.31 · 6 min', 'judge': 'gpt 9.0 gemini 6.0 claude 6.5'}, 'sol-two': {'prefix': '../snaps/r7solc2AfricanElephantRichCraft2/B/snaps/v01', 'meta': '$0.78 · 19 min', 'judge': 'gpt 6.5 gemini 5.0 claude 6.0'}},
    'alchemistWorkbench': {'sonnet-agent': {'prefix': '../snaps/alchemistWorkbenchSonnet/B/snaps/v02', 'meta': '$3.93 · 19 min', 'judge': 'gpt 9.0 gemini 7.0 claude 9.0'}, 'agent-draft': {'prefix': '../snaps/r7agentAlchemistWorkbenchRichCraft/B/snaps/v01', 'meta': '', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7fixAlchemistWorkbenchRichCraft/B/snaps/v01', 'meta': '$0.78 · 9 min', 'judge': 'gpt 8.0 gemini 6.5 claude 7.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2AlchemistWorkbenchRichCraft/B/snaps/v01', 'meta': '$1.18 · 10 min', 'judge': 'gpt 8.5 gemini 6.5 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r7solAlchemistWorkbenchRichCraft2/B/snaps/v01', 'meta': '$0.19 · 10 min', 'judge': 'gpt 6.5 gemini 6.0 claude 6.5'}, 'sol-two': {'prefix': '../snaps/r7solc2AlchemistWorkbenchRichCraft2/B/snaps/v01', 'meta': '$0.47 · 17 min', 'judge': 'gpt 9.0 gemini 7.0 claude 7.5'}},
    'ancientTreant': {'sonnet-agent': {'prefix': '../snaps/ancientTreantSonnet/B/snaps/v02', 'meta': '$4.54 · 19 min', 'judge': 'gpt 9.0 gemini 5.0 claude 7.0'}, 'agent-draft': {'prefix': '../snaps/r7agentfixAncientTreantRichCraft/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7AncientTreantRichCraft/B/snaps/v01', 'meta': '$0.64 · 8 min', 'judge': 'gpt 7.5 gemini 6.0 claude 6.5'}, 'sonnet-two': {'prefix': '../snaps/r7c2AncientTreantRichCraft/B/snaps/v01', 'meta': '$1.01 · 9 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r7solAncientTreantRichCraft2/B/snaps/v01', 'meta': '$0.16 · 5 min', 'judge': 'gpt 6.5 gemini 6.0 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r7solc2AncientTreantRichCraft2/B/snaps/v01', 'meta': '$0.44 · 10 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.0'}},
    'cyborgMedic': {'sonnet-agent': {'prefix': '../snaps/cyborgMedicSonnet/B/snaps/v02', 'meta': '$5.22 · 22 min', 'judge': 'gpt 8.5 gemini 7.0 claude 7.5'}, 'agent-draft': {'prefix': '../snaps/r7agentfixCyborgMedicRichCraft/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7CyborgMedicRichCraft/B/snaps/v01', 'meta': '$0.94 · 11 min', 'judge': 'gpt 6.5 gemini 6.0 claude 6.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2CyborgMedicRichCraft/B/snaps/v01', 'meta': '$1.29 · 13 min', 'judge': 'gpt 7.0 gemini 6.5 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r7solCyborgMedicRichCraft2/B/snaps/v01', 'meta': '$0.22 · 7 min', 'judge': 'gpt 8.0 gemini 5.5 claude 6.5'}, 'sol-two': {'prefix': '../snaps/r7solc2CyborgMedicRichCraft2/B/snaps/v01', 'meta': '$0.56 · 13 min', 'judge': 'gpt 9.0 gemini 6.0 claude 7.0'}},
    'elvenArcher': {'sonnet-agent': {'prefix': '../snaps/elvenArcherSonnet/B/snaps/v02', 'meta': '$5.43 · 28 min', 'judge': 'gpt 8.0 gemini 6.0 claude 5.5'}, 'agent-draft': {'prefix': '../snaps/r7agentElvenArcherRichCraft/B/snaps/v01', 'meta': '', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7ElvenArcherRichCraft/B/snaps/v01', 'meta': '$1.09 · 14 min', 'judge': 'gpt 7.0 gemini 7.0 claude 7.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2ElvenArcherRichCraft/B/snaps/v01', 'meta': '$1.47 · 15 min', 'judge': 'gpt 7.0 gemini 7.0 claude 6.5'}, 'sol-one': {'prefix': '../snaps/r7solElvenArcherRichCraft2/B/snaps/v01', 'meta': '$0.33 · 6 min', 'judge': 'gpt 8.0 gemini 5.5 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r7solc2ElvenArcherRichCraft2/B/snaps/v01', 'meta': '$0.54 · 9 min', 'judge': 'gpt 9.0 gemini 6.0 claude 8.0'}},
    'floatingIslandDiorama': {'sonnet-agent': {'prefix': '../snaps/floatingIslandDioramaSonnet/B/snaps/v02', 'meta': '$4.73 · 22 min', 'judge': 'gpt 8.0 gemini 7.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r7agentfixFloatingIslandDioramaRichCraft/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7FloatingIslandDioramaRichCraft/B/snaps/v01', 'meta': '$0.74 · 9 min', 'judge': 'gpt 7.5 gemini 6.0 claude 6.5'}, 'sonnet-two': {'prefix': '../snaps/r7c2FloatingIslandDioramaRichCraft/B/snaps/v01', 'meta': '$1.13 · 11 min', 'judge': 'gpt 7.0 gemini 6.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r7solFloatingIslandDioramaRichCraft2/B/snaps/v01', 'meta': '$0.27 · 5 min', 'judge': 'gpt 9.0 gemini 6.5 claude 7.5'}, 'sol-two': {'prefix': '../snaps/r7solc2FloatingIslandDioramaRichCraft2/B/snaps/v01', 'meta': '$0.67 · 13 min', 'judge': 'gpt 8.5 gemini 6.0 claude 8.0'}},
    'kraken': {'sonnet-agent': {'prefix': '../snaps/krakenSonnet/B/snaps/v02', 'meta': '$5.03 · 20 min', 'judge': 'gpt 8.0 gemini 6.0 claude 5.5'}, 'agent-draft': {'prefix': '../snaps/r7agentKrakenRichCraft/B/snaps/v01', 'meta': '', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7KrakenRichCraft/B/snaps/v01', 'meta': '$0.69 · 9 min', 'judge': 'gpt 7.0 gemini 6.5 claude 8.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2KrakenRichCraft/B/snaps/v01', 'meta': '$1.04 · 10 min', 'judge': 'gpt 6.5 gemini 7.0 claude 8.0'}, 'sol-one': {'prefix': '../snaps/r7solfixKrakenRichCraft2/B/snaps/v01', 'meta': '$0.27 · 3 min', 'judge': 'gpt 8.0 gemini 5.5 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r7solc2KrakenRichCraft2/B/snaps/v01', 'meta': '$0.51 · 7 min', 'judge': 'gpt 9.0 gemini 6.0 claude 7.5'}},
    'monsterTruck': {'sonnet-agent': {'prefix': '../snaps/monsterTruckSonnet/B/snaps/v02', 'meta': '$4.42 · 20 min', 'judge': 'gpt 9.0 gemini 6.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r7agentfixMonsterTruckRichCraft/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7MonsterTruckRichCraft/B/snaps/v01', 'meta': '$0.64 · 8 min', 'judge': 'gpt 8.5 gemini 7.0 claude 8.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2MonsterTruckRichCraft/B/snaps/v01', 'meta': '$0.82 · 9 min', 'judge': 'gpt 8.5 gemini 7.0 claude 7.5'}, 'sol-one': {'prefix': '../snaps/r7solMonsterTruckRichCraft2/B/snaps/v01', 'meta': '$0.23 · 4 min', 'judge': 'gpt 8.0 gemini 5.0 claude 6.5'}, 'sol-two': {'prefix': '../snaps/r7solc2MonsterTruckRichCraft2/B/snaps/v01', 'meta': '$0.39 · 7 min', 'judge': 'gpt 9.5 gemini 6.5 claude 7.0'}},
    'qilin': {'sonnet-agent': {'prefix': '../snaps/qilinSonnet/B/snaps/v02', 'meta': '$2.80 · 16 min', 'judge': 'gpt 9.0 gemini 5.5 claude 7.0'}, 'agent-draft': {'prefix': '../snaps/r7agentQilinRichCraft/B/snaps/v01', 'meta': '', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7QilinRichCraft/B/snaps/v01', 'meta': '$0.62 · 8 min', 'judge': 'gpt 8.0 gemini 6.5 claude 8.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2QilinRichCraft/B/snaps/v01', 'meta': '$0.96 · 9 min', 'judge': 'gpt 7.0 gemini 6.5 claude 8.0'}, 'sol-one': {'prefix': '../snaps/r7solQilinRichCraft2/B/snaps/v01', 'meta': '$0.31 · 5 min', 'judge': 'gpt 7.5 gemini 5.5 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r7solc2QilinRichCraft2/B/snaps/v01', 'meta': '$0.71 · 13 min', 'judge': 'gpt 8.5 gemini 6.5 claude 7.0'}},
    'soulScythe': {'sonnet-agent': {'prefix': '../snaps/soulScytheSonnet/B/snaps/v02', 'meta': '$2.03 · 10 min', 'judge': 'gpt 9.0 gemini 4.5 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r7agentSoulScytheRichCraft/B/snaps/v01', 'meta': '', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7SoulScytheRichCraft/B/snaps/v01', 'meta': '$0.60 · 7 min', 'judge': 'gpt 7.0 gemini 5.5 claude 6.5'}, 'sonnet-two': {'prefix': '../snaps/r7c2SoulScytheRichCraft/B/snaps/v01', 'meta': '$0.77 · 9 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.5'}, 'sol-one': {'prefix': '../snaps/r7solSoulScytheRichCraft2/B/snaps/v01', 'meta': '$0.29 · 5 min', 'judge': 'gpt 8.0 gemini 7.0 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r7solc2SoulScytheRichCraft2/B/snaps/v01', 'meta': '$0.45 · 8 min', 'judge': 'gpt 9.0 gemini 7.0 claude 7.0'}},
    'treasureHoard': {'sonnet-agent': {'prefix': '../snaps/treasureHoardSonnet/B/snaps/v02', 'meta': '$5.72 · 23 min', 'judge': 'gpt 8.5 gemini 7.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r7agentTreasureHoardRichCraft/B/snaps/v01', 'meta': '', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7TreasureHoardRichCraft/B/snaps/v01', 'meta': '$0.65 · 8 min', 'judge': 'gpt 7.0 gemini 6.0 claude 5.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2TreasureHoardRichCraft/B/snaps/v01', 'meta': '$1.03 · 9 min', 'judge': 'gpt 8.0 gemini 6.5 claude 6.0'}, 'sol-one': {'prefix': '../snaps/r7solTreasureHoardRichCraft2/B/snaps/v01', 'meta': '$0.28 · 5 min', 'judge': 'gpt 7.0 gemini 5.5 claude 7.5'}, 'sol-two': {'prefix': '../snaps/r7solc2TreasureHoardRichCraft2/B/snaps/v01', 'meta': '$0.69 · 13 min', 'judge': 'gpt 9.0 gemini 6.5 claude 8.0'}},
    'capybara': {'sonnet-agent': {'prefix': '../snaps/capybaraSonnet/B/snaps/v02', 'meta': '$3.97 · 20 min', 'judge': 'gpt 6.0 gemini 6.0 claude 5.0'}, 'agent-draft': {'prefix': '../snaps/r7agentCapybaraRichCraft/B/snaps/v01', 'meta': '', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r7CapybaraRichCraft/B/snaps/v01', 'meta': '$0.63 · 8 min', 'judge': 'gpt 7.0 gemini 6.5 claude 7.0'}, 'sonnet-two': {'prefix': '../snaps/r7c2CapybaraRichCraft/B/snaps/v01', 'meta': '$0.97 · 9 min', 'judge': 'gpt 8.0 gemini 7.0 claude 7.5'}, 'sol-one': {'prefix': '../snaps/r7solCapybaraRichCraft2/B/snaps/v01', 'meta': '$0.26 · 4 min', 'judge': 'gpt 8.0 gemini 5.0 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r7solc2CapybaraRichCraft2/B/snaps/v01', 'meta': '$0.63 · 12 min', 'judge': 'gpt 9.0 gemini 5.0 claude 7.0'}},
    'redPanda': {'sonnet-agent': {'prefix': '../snaps/redPandaSonnet/B/snaps/v02', 'meta': '$2.46 · 13 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r5agentRedPandaRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5RedPandaRichDocs/B/snaps/v01', 'meta': '$0.63 · 7 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8RedPandaRichCraft2/B/snaps/v01', 'meta': '$0.79 · 8 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2RedPandaRichCraft2/B/snaps/v01', 'meta': '$0.94 · 9 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r9solRedPandaRichCraft2/B/snaps/v01', 'meta': '$0.27 · 4 min', 'judge': 'gpt 6.5 gemini 4.5 claude 5.5'}, 'sol-two': {'prefix': '../snaps/r9solc2RedPandaRichCraft2/B/snaps/v01', 'meta': '$0.75 · 10 min', 'judge': 'gpt 6.5 gemini 5.0 claude 6.0'}},
    'koala': {'sonnet-agent': {'prefix': '../snaps/koalaSonnet/B/snaps/v02', 'meta': '$2.27 · 13 min', 'judge': 'gpt 8.0 gemini 6.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r5agentKoalaRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5KoalaRichDocs/B/snaps/v01', 'meta': '$0.44 · 5 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8KoalaRichCraft2/B/snaps/v01', 'meta': '$0.71 · 7 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2KoalaRichCraft2/B/snaps/v01', 'meta': '$0.85 · 8 min', 'judge': 'gpt 6.0 gemini 4.5 claude 5.5'}, 'sol-one': {'prefix': '../snaps/r9solKoalaRichCraft2/B/snaps/v01', 'meta': '$0.23 · 3 min', 'judge': 'gpt 7.0 gemini 6.0 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2KoalaRichCraft2/B/snaps/v01', 'meta': '$0.53 · 8 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.0'}},
    'wizardBookshelf': {'sonnet-agent': {'prefix': '../snaps/wizardBookshelfSonnet/B/snaps/v02', 'meta': '$3.65 · 17 min', 'judge': 'gpt 10.0 gemini 7.0 claude 9.0'}, 'agent-draft': {'prefix': '../snaps/r5agentWizardBookshelfRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5WizardBookshelfRichDocs/B/snaps/v01', 'meta': '$0.62 · 8 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8WizardBookshelfRichCraft2/B/snaps/v01', 'meta': '$0.77 · 8 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2WizardBookshelfRichCraft2/B/snaps/v01', 'meta': '$0.94 · 9 min', 'judge': 'gpt 9.0 gemini 6.0 claude 8.0'}, 'sol-one': {'prefix': '../snaps/r9solWizardBookshelfRichCraft2/B/snaps/v01', 'meta': '$0.25 · 3 min', 'judge': 'gpt 7.0 gemini 5.0 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2WizardBookshelfRichCraft2/B/snaps/v01', 'meta': '$0.52 · 7 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.0'}},
    'grayWolf': {'sonnet-agent': {'prefix': '../snaps/grayWolfSonnet/B/snaps/v02', 'meta': '$4.49 · 20 min', 'judge': 'gpt 5.0 gemini 4.0 claude 4.0'}, 'agent-draft': {'prefix': '../snaps/r5agentfixGrayWolfRichKitsamb/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5GrayWolfRichDocs/B/snaps/v01', 'meta': '$0.40 · 4 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8GrayWolfRichCraft2/B/snaps/v01', 'meta': '$0.78 · 8 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2GrayWolfRichCraft2/B/snaps/v01', 'meta': '$0.94 · 9 min', 'judge': 'gpt 8.5 gemini 7.0 claude 8.0'}, 'sol-one': {'prefix': '../snaps/r9solGrayWolfRichCraft2/B/snaps/v01', 'meta': '$0.27 · 4 min', 'judge': 'gpt 7.5 gemini 5.5 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2GrayWolfRichCraft2/B/snaps/v01', 'meta': '$0.74 · 10 min', 'judge': 'gpt 8.5 gemini 6.0 claude 6.5'}},
    'phoenix': {'sonnet-agent': {'prefix': '../snaps/phoenixSonnet/B/snaps/v02', 'meta': '$4.77 · 23 min', 'judge': 'gpt 8.5 gemini 7.0 claude 6.0'}, 'agent-draft': {'prefix': '../snaps/r5agentPhoenixRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5PhoenixRichDocs/B/snaps/v01', 'meta': '$0.44 · 5 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8PhoenixRichCraft2/B/snaps/v01', 'meta': '$0.97 · 10 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2PhoenixRichCraft2/B/snaps/v01', 'meta': '$1.11 · 11 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r9solPhoenixRichCraft2/B/snaps/v01', 'meta': '$0.30 · 4 min', 'judge': 'gpt 7.0 gemini 6.0 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r9solc2PhoenixRichCraft2/B/snaps/v01', 'meta': '$0.56 · 8 min', 'judge': 'gpt 9.0 gemini 6.0 claude 8.0'}},
    'nineTailedKitsune': {'sonnet-agent': {'prefix': '../snaps/nineTailedKitsuneSonnet/B/snaps/v02', 'meta': '$3.74 · 17 min', 'judge': 'gpt 8.0 gemini 6.5 claude 7.5'}, 'agent-draft': {'prefix': '../snaps/r5agentfix2NineTailedKitsuneRichKitsamb/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5NineTailedKitsuneRichDocs/B/snaps/v01', 'meta': '$0.46 · 6 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8NineTailedKitsuneRichCraft2/B/snaps/v01', 'meta': '$0.82 · 8 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2NineTailedKitsuneRichCraft2/B/snaps/v01', 'meta': '$0.97 · 9 min', 'judge': 'gpt 7.0 gemini 5.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r9solNineTailedKitsuneRichCraft2/B/snaps/v01', 'meta': '$0.30 · 5 min', 'judge': 'gpt 8.0 gemini 5.5 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2NineTailedKitsuneRichCraft2/B/snaps/v01', 'meta': '$0.83 · 12 min', 'judge': 'gpt 9.0 gemini 6.5 claude 7.5'}},
    'barnstormerBiplane': {'sonnet-agent': {'prefix': '../snaps/barnstormerBiplaneSonnet/B/snaps/v02', 'meta': '$4.46 · 21 min', 'judge': 'gpt 9.5 gemini 6.0 claude 8.5'}, 'agent-draft': {'prefix': '../snaps/r5agentBarnstormerBiplaneRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5BarnstormerBiplaneRichDocs/B/snaps/v01', 'meta': '$0.44 · 5 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8BarnstormerBiplaneRichCraft2/B/snaps/v01', 'meta': '$0.90 · 9 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2BarnstormerBiplaneRichCraft2/B/snaps/v01', 'meta': '$1.07 · 10 min', 'judge': 'gpt 8.5 gemini 6.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r9solBarnstormerBiplaneRichCraft2/B/snaps/v01', 'meta': '$0.31 · 6 min', 'judge': 'gpt 8.0 gemini 7.0 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r9solc2BarnstormerBiplaneRichCraft2/B/snaps/v01', 'meta': '$0.58 · 8 min', 'judge': 'gpt 8.5 gemini 7.0 claude 8.0'}},
    'chopperMotorbike': {'sonnet-agent': {'prefix': '../snaps/chopperMotorbikeSonnet/B/snaps/v02', 'meta': '$5.10 · 21 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.0'}, 'agent-draft': {'prefix': '../snaps/r5agentfixChopperMotorbikeRichKitsamb/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5ChopperMotorbikeRichDocs/B/snaps/v01', 'meta': '$0.49 · 6 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8ChopperMotorbikeRichCraft2/B/snaps/v01', 'meta': '$1.06 · 11 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2ChopperMotorbikeRichCraft2/B/snaps/v01', 'meta': '$1.25 · 13 min', 'judge': 'gpt 7.5 gemini 7.0 claude 7.5'}, 'sol-one': {'prefix': '../snaps/r9solfixChopperMotorbikeRichCraft2/B/snaps/v01', 'meta': '$0.44 · 6 min', 'judge': 'gpt 9.0 gemini 6.5 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r9solc2ChopperMotorbikeRichCraft2/B/snaps/v01', 'meta': '$0.89 · 13 min', 'judge': 'gpt 8.0 gemini 6.5 claude 7.5'}},
    'swampTroll': {'sonnet-agent': {'prefix': '../snaps/swampTrollSonnet/B/snaps/v02', 'meta': '$4.16 · 19 min', 'judge': 'gpt 9.0 gemini 5.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r5agentfixSwampTrollRichKitsamb/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5SwampTrollRichDocs/B/snaps/v01', 'meta': '$0.70 · 9 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8SwampTrollRichCraft2/B/snaps/v01', 'meta': '$0.89 · 11 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2SwampTrollRichCraft2/B/snaps/v01', 'meta': '$1.05 · 12 min', 'judge': 'gpt 9.0 gemini 7.0 claude 9.0'}, 'sol-one': {'prefix': '../snaps/r9solfix2SwampTrollRichCraft2/B/snaps/v01', 'meta': '$0.41 · 6 min', 'judge': 'gpt 7.5 gemini 6.0 claude 6.5'}, 'sol-two': {'prefix': '../snaps/r9solc2SwampTrollRichCraft2/B/snaps/v01', 'meta': '$0.77 · 12 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.0'}},
    'lavaGolem': {'sonnet-agent': {'prefix': '../snaps/lavaGolemSonnet/B/snaps/v02', 'meta': '$4.58 · 18 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r5agentLavaGolemRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5LavaGolemRichDocs/B/snaps/v01', 'meta': '$0.37 · 5 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8LavaGolemRichCraft2/B/snaps/v01', 'meta': '$0.58 · 7 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2LavaGolemRichCraft2/B/snaps/v01', 'meta': '$0.73 · 8 min', 'judge': 'gpt 7.5 gemini 7.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r9solLavaGolemRichCraft2/B/snaps/v01', 'meta': '$0.30 · 5 min', 'judge': 'gpt 6.0 gemini 6.0 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2LavaGolemRichCraft2/B/snaps/v01', 'meta': '$0.72 · 12 min', 'judge': 'gpt 8.5 gemini 6.0 claude 6.5'}},
    'frostAxe': {'sonnet-agent': {'prefix': '../snaps/frostAxeSonnet/B/snaps/v02', 'meta': '$1.95 · 12 min', 'judge': 'gpt 7.5 gemini 5.5 claude 7.0'}, 'agent-draft': {'prefix': '../snaps/r5agentfixFrostAxeRichKitsamb/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5FrostAxeRichDocs/B/snaps/v01', 'meta': '$0.17 · 2 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8fixFrostAxeRichCraft2/B/snaps/v01', 'meta': '$0.46 · 5 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2FrostAxeRichCraft2/B/snaps/v01', 'meta': '$0.62 · 7 min', 'judge': 'gpt 9.0 gemini 6.5 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r9solFrostAxeRichCraft2/B/snaps/v01', 'meta': '$0.28 · 5 min', 'judge': 'gpt 7.5 gemini 6.0 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r9solc2FrostAxeRichCraft2/B/snaps/v01', 'meta': '$0.53 · 10 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.0'}},
    'lanternShrine': {'sonnet-agent': {'prefix': '../snaps/lanternShrineSonnet/B/snaps/v02', 'meta': '$6.62 · 28 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.5'}, 'agent-draft': {'prefix': '../snaps/r5agentLanternShrineRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5LanternShrineRichDocs/B/snaps/v01', 'meta': '$0.63 · 8 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8LanternShrineRichCraft2/B/snaps/v01', 'meta': '$0.75 · 9 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2LanternShrineRichCraft2/B/snaps/v01', 'meta': '$0.91 · 10 min', 'judge': 'gpt 7.5 gemini 6.0 claude 7.0'}, 'sol-one': {'prefix': '../snaps/r9solLanternShrineRichCraft2/B/snaps/v01', 'meta': '$0.19 · 10 min', 'judge': 'gpt 7.5 gemini 6.0 claude 7.0'}, 'sol-two': {'prefix': '../snaps/r9solc2LanternShrineRichCraft2/B/snaps/v01', 'meta': '$0.52 · 17 min', 'judge': 'gpt 9.0 gemini 6.5 claude 8.0'}},
    'dwarfRifleman': {'sonnet-agent': {'prefix': '../snaps/dwarfRiflemanSonnet/B/snaps/v02', 'meta': '$4.02 · 20 min', 'judge': 'gpt 9.0 gemini 7.0 claude 7.5'}, 'agent-draft': {'prefix': '../snaps/r5agentDwarfRiflemanRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5DwarfRiflemanRichDocs/B/snaps/v01', 'meta': '$0.72 · 9 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8DwarfRiflemanRichCraft2/B/snaps/v01', 'meta': '$0.71 · 9 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2DwarfRiflemanRichCraft2/B/snaps/v01', 'meta': '$0.90 · 10 min', 'judge': 'gpt 7.0 gemini 5.5 claude 7.5'}, 'sol-one': {'prefix': '../snaps/r9solDwarfRiflemanRichCraft2/B/snaps/v01', 'meta': '$0.18 · 8 min', 'judge': 'gpt 6.0 gemini 5.5 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2DwarfRiflemanRichCraft2/B/snaps/v01', 'meta': '$0.36 · 10 min', 'judge': 'gpt 9.0 gemini 6.0 claude 7.0'}},
    'desertOasisDiorama': {'sonnet-agent': {'prefix': '../snaps/desertOasisDioramaSonnet/B/snaps/v02', 'meta': '$6.30 · 27 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.0'}, 'agent-draft': {'prefix': '../snaps/r5agentfixDesertOasisDioramaRichKitsamb/B/snaps/v01', 'meta': 'crash fixed by repair turn', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5DesertOasisDioramaRichDocs/B/snaps/v01', 'meta': '$0.62 · 8 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8DesertOasisDioramaRichCraft2/B/snaps/v01', 'meta': '$0.72 · 9 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2DesertOasisDioramaRichCraft2/B/snaps/v01', 'meta': '$0.90 · 10 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.0'}, 'sol-one': {'prefix': '../snaps/r9solfixDesertOasisDioramaRichCraft2/B/snaps/v01', 'meta': '$0.31 · 5 min', 'judge': 'gpt 7.0 gemini 5.0 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2DesertOasisDioramaRichCraft2/B/snaps/v01', 'meta': '$0.75 · 14 min', 'judge': 'gpt 8.0 gemini 6.0 claude 7.0'}},
    'pixelDungeonProps': {'sonnet-agent': {'prefix': '../snaps/pixelDungeonPropsSonnet/B/snaps/v02', 'meta': '$3.76 · 18 min', 'judge': 'gpt 9.0 gemini 7.0 claude 7.5'}, 'agent-draft': {'prefix': '../snaps/r5agentPixelDungeonPropsRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5PixelDungeonPropsRichDocs/B/snaps/v01', 'meta': '$0.52 · 6 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8PixelDungeonPropsRichCraft2/B/snaps/v01', 'meta': '$0.73 · 9 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2PixelDungeonPropsRichCraft2/B/snaps/v01', 'meta': '$0.99 · 11 min', 'judge': 'gpt 9.0 gemini 6.0 claude 8.0'}, 'sol-one': {'prefix': '../snaps/r9solPixelDungeonPropsRichCraft2/B/snaps/v01', 'meta': '$0.27 · 5 min', 'judge': 'gpt 7.0 gemini 5.5 claude 6.0'}, 'sol-two': {'prefix': '../snaps/r9solc2PixelDungeonPropsRichCraft2/B/snaps/v01', 'meta': '$0.42 · 8 min', 'judge': 'gpt 8.0 gemini 6.5 claude 7.0'}},
    'gnomeTinkerer': {'sonnet-agent': {'prefix': '../snaps/gnomeTinkererSonnet/B/snaps/v02', 'meta': '$4.60 · 23 min', 'judge': 'gpt 8.5 gemini 6.0 claude 7.0'}, 'agent-draft': {'prefix': '../snaps/r5agentGnomeTinkererRichKitsamb/B/snaps/v01', 'meta': '', 'judge': ''}, 'oldlab': {'prefix': '../snaps/r5GnomeTinkererRichDocs/B/snaps/v01', 'meta': '$0.56 · 7 min', 'judge': ''}, 'sonnet-one': {'prefix': '../snaps/r8GnomeTinkererRichCraft2/B/snaps/v01', 'meta': '$0.93 · 12 min', 'judge': ''}, 'sonnet-two': {'prefix': '../snaps/r8c2GnomeTinkererRichCraft2/B/snaps/v01', 'meta': '$1.13 · 13 min', 'judge': 'gpt 9.0 gemini 7.0 claude 8.5'}, 'sol-one': {'prefix': '../snaps/r9solGnomeTinkererRichCraft2/B/snaps/v01', 'meta': '$0.30 · 6 min', 'judge': 'gpt 7.0 gemini 6.0 claude 6.5'}, 'sol-two': {'prefix': '../snaps/r9solc2GnomeTinkererRichCraft2/B/snaps/v01', 'meta': '$0.48 · 9 min', 'judge': 'gpt 8.5 gemini 6.0 claude 7.5'}},
}

COLUMNS = [
    ("sonnet-agent", "Sonnet", "agentic", "Sonnet · agentic session (final)", "The agentic session's finished model (~18 min, many turns, renders and looks at itself)."),
    ("agent-draft", "Agent", "one", "Agent · first draft", "The same Sonnet session's first file write, before it saw any render. One generation; repaired when necessary."),
    ("oldlab", "Old lab prompt", "one", "Sonnet · old lab prompt", "The original docs-only lab prompt; development set only."),
    ("sonnet-one", "Sonnet", "one", "Sonnet · single-run", "One call, new prompt (style kits + paint source + detail target + craft habits); repaired by separate calls when necessary."),
    ("sonnet-two", "Sonnet", "two", "Sonnet · after 2 feedback turns", "The single-run build plus two screenshot-and-measurement feedback turns."),
    ("sol-one", "Sol", "one", "Sol · single-run", "GPT-6.1 Sol, high effort, craft2 prompt; repaired by separate calls when necessary."),
    ("sol-two", "Sol", "two", "Sol · after 2 feedback turns", "GPT-6.1 Sol, same pipeline, plus two feedback turns."),
    ("astra-agent", "Astra", "agentic", "Astra · agentic session (final)", "GPT-6 Astra agentic session, latest archived render; model identity checked against its build record."),
    ("astra-one", "Astra", "one", "Astra · single-run", "GPT-6 Astra, high effort, craft2 prompt; up to two separate repair calls when necessary."),
    ("astra-two", "Astra", "two", "Astra · after 2 feedback turns", "GPT-6 Astra, same pipeline, plus two feedback turns."),
    ("gem-one", "Gemini", "one", "Gemini · single-run", "Gemini 3.8 Flash via google-antigravity, high effort, craft2 prompt; up to two separate repair calls."),
    ("gem-two", "Gemini", "two", "Gemini · after 2 feedback turns", "Gemini 3.8 Flash, same pipeline, plus two feedback turns."),
    ("haiku-agent", "Haiku", "agentic", "Haiku · agentic session (final)", "Haiku agentic session, latest archived render; model identity checked against its build record."),
]
MODELS = ["Agent", "Sonnet", "Sol", "Astra", "Gemini", "Old lab prompt"]
AGENTIC = ["Sonnet", "Astra", "Haiku"]
MODEL_IDS = {"Sonnet": "anthropic/claude-sonnet-5-5", "Astra": "openai-codex/gpt-6-astra", "Haiku": "anthropic/claude-haiku-5-5"}


def load(path, default=None):
    return json.loads(path.read_text()) if path.exists() else default


@lru_cache(maxsize=None)
def results(round_id):
    return load(ROUNDS / round_id / "results.json", [])


def round_for_slug(slug):
    return re.split(r"(?=[A-Z])", slug, maxsplit=1)[0]


@lru_cache(maxsize=None)
def record(slug):
    round_id = round_for_slug(slug)
    entry = next((r for r in results(round_id) if r["slug"] == slug), None)
    return entry or load(ROUNDS / round_id / "runs" / f"{slug}.json", {})


def chain_time(entry):
    total = 0
    seen = set()
    while entry and entry.get("slug") not in seen:
        seen.add(entry.get("slug"))
        total += entry.get("wallMs", 0) or 0
        entry = record(entry["from"]) if entry.get("from") else None
    return total / 1000


def caption(cost, seconds):
    money = f"${cost:.2f}" if cost is not None else "cost unavailable"
    duration = f"{seconds / 60:.0f} min" if seconds >= 60 else f"{seconds:.0f} s"
    return f"{money} · {duration}"


def checked(entry):
    slug = entry["slug"]
    return load(ROUNDS / round_for_slug(slug) / "checks" / f"{slug}.json", entry.get("check"))


def live_entry(subject, base, stage):
    # Prefer the latest repair even if it still crashes; never hide a failure
    # behind an earlier successful build. A +2 tile appears only after turn 2.
    capped = next((r for r in results(base + "fix2") if r.get("subject") == subject and r.get("arm") == "craft2"), None)
    if capped and checked(capped) and not checked(capped).get("rendered"):
        return {**capped, "repairLimitReached": True}
    rounds = [base + "c2"] if stage == "two" else [base + "fix2", base + "fix", base]
    for round_id in rounds:
        entry = next((r for r in results(round_id) if r.get("subject") == subject and r.get("arm") == "craft2"), None)
        if entry:
            return entry
    return None


def latest_prefix(slug):
    shots = list((SNAPS / slug).glob("*/snaps/*-three-quarter.png"))
    if not shots:
        return None
    latest = max(shots, key=lambda p: (p.stat().st_mtime_ns, p.name))
    return "../snaps/" + latest.relative_to(SNAPS).as_posix().removesuffix("-three-quarter.png")


def agent_tile(subject, model, archived=None):
    suffix = {"Sonnet": "Sonnet", "Astra": "", "Haiku": "Haiku"}[model]
    slug = subject + suffix
    build = load(ROOT / "samples" / f"{slug}.build.json", {})
    actual = build.get("builder", {}).get("modelId")
    if actual != MODEL_IDS[model]:
        raise ValueError(f"{slug}: expected {MODEL_IDS[model]}, got {actual!r}")
    prefix = archived.get("prefix") if archived else latest_prefix(slug)
    return {"prefix": prefix, "meta": caption(build.get("cost"), build.get("wallSeconds", 0)), "judge": (archived or {}).get("judge", "")}


def tile_data(subject, column, round_prefix):
    key, model, stage, *_ = column
    archived = LEGACY.get(subject, {}).get(key)
    if stage == "agentic":
        return agent_tile(subject, model, archived)
    if key.startswith(("astra-", "gem-")):
        base = round_prefix + ("astra" if model == "Astra" else "gem")
        entry = live_entry(subject, base, stage)
        if not entry:
            return {"status": "not built"}
        check = checked(entry)
        meta = caption(entry.get("chainCostUsd", entry.get("costUsd")), chain_time(entry))
        modes = {"critique": 0, "repair": 0}
        previous = entry
        seen = set()
        while previous and previous.get("slug") not in seen:
            seen.add(previous.get("slug"))
            if previous.get("mode") in modes:
                modes[previous["mode"]] += 1
            previous = record(previous["from"]) if previous.get("from") else None
        meta += f" · {modes['critique']} critique, {modes['repair']} repair turns"
        if entry.get("repairLimitReached"):
            meta += " · repair limit reached; later over-limit runs excluded"
        if not entry.get("hasCode"):
            return {"status": "not built", "meta": meta, "error": str(entry.get("error") or entry.get("finishReason") or "No module returned")}
        if not check:
            return {"status": "not built", "meta": meta + " · awaiting render check"}
        if not check.get("rendered"):
            return {"status": "crashed", "meta": meta, "error": check.get("renderError", "")}
        prefix = f"../snaps/{entry['slug']}/{check['lane']}/snaps/v01"
        return {"prefix": prefix, "meta": meta}
    if not archived:
        return {"status": "not built"}
    data = dict(archived)
    if data.get("prefix"):
        slug = data["prefix"].split("/")[2]
        entry = record(slug)
        if entry:
            check = checked(entry)
            if check and not check.get("rendered"):
                data.update(prefix=None, status="crashed", error=check.get("renderError", ""))
            if entry.get("wallMs") is not None:
                data["meta"] = caption(entry.get("chainCostUsd", entry.get("costUsd")), chain_time(entry))
                if key == "agent-draft" and entry.get("mode") == "repair":
                    data["meta"] += " · crash fixed by repair turn"
    return data


def cell(subject, column, round_prefix):
    key, model, stage, *_ = column
    data = tile_data(subject, column, round_prefix)
    attrs = f'data-model="{model}" data-stage="{stage}"'
    base = ' class="base"' if key == "sonnet-agent" else ""
    prefix = data.get("prefix")
    if prefix and not (OUTPUT.parent / (prefix + "-three-quarter.png")).exists():
        prefix = None
    if prefix:
        shot = html.escape(prefix, quote=True)
        views = [v for v in ["three-quarter", "front", "side", "back", "low", "head"] if (OUTPUT.parent / (prefix + "-" + v + ".png")).exists()]
        picture = f'<a href="{shot}-sheet.jpg" target="_blank" rel="noopener"><img loading="lazy" alt="{html.escape(subject + ": " + column[3], quote=True)}" data-prefix="{shot}" data-views="{",".join(views)}" src="{shot}-three-quarter.png"></a>'
    else:
        status = data.get("status", "not built")
        picture = f'<div class="empty" title="{html.escape(str(data.get("error", "")), quote=True)}">{status}</div>'
    return f'<td {attrs}{base}>{picture}<div class="meta">{html.escape(data.get("meta", ""))}</div><div class="judge">{data.get("judge", "")}</div></td>'


STYLE = """
body{font:14px/1.4 system-ui,sans-serif;margin:16px;background:#f4f4f2;color:#222}
h1{font-size:22px;margin:0 0 6px}h2{margin:28px 0 4px}.intro{max-width:1100px;color:#444}
.bar{position:sticky;top:0;background:#f4f4f2;padding:8px 0;z-index:5;border-bottom:1px solid #ccc}
.bar button{font:inherit;padding:4px 10px;margin-right:4px;border:1px solid #999;background:#fff;border-radius:4px;cursor:pointer}
.bar button.on{background:#222;color:#fff}.bar label{display:inline-block;margin-right:12px}.filters{margin-top:6px}
.scroll{overflow:visible}table{border-collapse:collapse;width:100%;table-layout:fixed}
th,td{vertical-align:top;padding:4px;border-bottom:1px solid #ddd}
thead th{position:sticky;top:var(--bar,100px);background:#f4f4f2;z-index:4;text-align:left}
.cn{font-weight:700;font-size:15px}.cd{font-weight:400;font-size:12px;color:#555}
.rowh{width:150px;text-align:left}.subj{font-weight:700;overflow-wrap:anywhere}.brief{font-size:12px;color:#555;font-weight:400}
td img{width:100%;height:auto;aspect-ratio:1;object-fit:contain;background:#e2e4e8;display:block}
td.base img{outline:3px solid #2a7}.meta{font-size:12px;color:#666}.judge{font-size:11px;color:#a50;display:none}
body.showj .judge{display:block}.empty{aspect-ratio:1;background:#e2e4e8;color:#777;display:grid;place-items:center}
[hidden]{display:none!important}
"""
SCRIPT = """
const setBar=()=>document.documentElement.style.setProperty('--bar',document.querySelector('.bar').offsetHeight+'px');
const filters=[...document.querySelectorAll('input[data-filter]')];
const applyFilters=()=>{
 const pick=f=>new Set(filters.filter(i=>i.dataset.filter===f&&i.checked).map(i=>i.value));
 const models=pick('model'),stages=pick('stage'),agentic=pick('agentic');
 document.querySelectorAll('th[data-model],td[data-model]').forEach(cell=>{
  cell.hidden=cell.dataset.stage==='agentic'?!agentic.has(cell.dataset.model):(!models.has(cell.dataset.model)||!stages.has(cell.dataset.stage));
 });
 setBar();
};
filters.forEach(i=>i.addEventListener('change',applyFilters));applyFilters();addEventListener('resize',setBar);
document.querySelectorAll('.bar button').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.bar button').forEach(x=>x.classList.toggle('on',x===b));
 document.querySelectorAll('img[data-prefix]').forEach(i=>{
  const view=i.dataset.views.split(',').includes(b.dataset.v)?b.dataset.v:'three-quarter';
  i.src=i.dataset.prefix+'-'+view+'.png';
 });
});
document.getElementById('showj').onchange=e=>document.body.classList.toggle('showj',e.target.checked);
"""


def main():
    out = ['<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent vs single-run</title><style>', STYLE, '</style></head><body>',
           '<h1>Agentic sessions vs single-run builds and feedback pipelines, same briefs</h1>',
           '<p class="intro">Every row is one brief, exactly as the agentic builder got it. <b>The first column (green outline) is the baseline</b>: the model the Sonnet agentic session finished. Agentic-session columns show archived agent builds; first drafts and plain API pipelines show how they compare. Click any picture for that build\'s full contact sheet (12 views, skeleton, flex tests). Below each picture: cost and model time of that pipeline (agentic columns show session wall time). "Judge scores" shows existing scores from the three vision judges (1–10, mean of two orders each). No new builds are judged. Single-run builds use one request and one reply, with no tools; crash repairs are separate calls and do not change that label. Their costs and times are included in the captions. A second-stage tile appears only after feedback turn 2.</p>',
           '<div class="bar">View: ']
    for view, label in [("three-quarter", "three-quarter"), ("front", "front"), ("side", "side"), ("back", "back"), ("low", "low"), ("head", "head close-up")]:
        out.append(f'<button data-v="{view}" class="{"on" if view == "three-quarter" else ""}">{label}</button>')
    out.append('<label><input type="checkbox" id="showj"> show judge scores</label><div class="filters">Agentic sessions (final): ')
    for model in AGENTIC:
        enabled = "checked" if model == "Sonnet" else ""
        out.append(f'<label><input type="checkbox" data-filter="agentic" value="{model}" {enabled}> {model} agentic</label>')
    out.append('</div><div class="filters">API builders: ')
    for model in MODELS:
        enabled = "checked" if model != "Old lab prompt" else ""
        out.append(f'<label><input type="checkbox" data-filter="model" value="{model}" {enabled}> {model}</label>')
    out.append('</div><div class="filters">API stages: <label><input type="checkbox" data-filter="stage" value="one" checked> single-run / first draft</label><label><input type="checkbox" data-filter="stage" value="two" checked> +2 turns</label> <span class="meta">"Agent" is the Sonnet session\'s first draft. Reload to see newly completed rounds.</span></div></div>')
    sections = [("pitches-r7.json", "r10", "Held-out set: 12 briefs never used while tuning the prompts", "These are the honest test. The single-run prompts were written while looking at the development set below, never at these."),
                ("pitches-r5.json", "r11", "Development set: 16 briefs the prompts were tuned on", "Includes the old lab prompt column, to show where the single-run builds started (off by default).")]
    for pitches, prefix, heading, intro in sections:
        out.append(f'<h2>{heading}</h2><p class="intro">{intro}</p><div class="scroll"><table><thead><tr><th class="rowh"></th>')
        for key, model, stage, title, description in COLUMNS:
            out.append(f'<th data-model="{model}" data-stage="{stage}"><div class="cn">{title}</div><div class="cd">{html.escape(description)}</div></th>')
        out.append('</tr></thead><tbody>')
        for subject in load(ROOT / "bakeoff" / pitches)["subjects"]:
            brief = html.escape(subject["rich"]).replace("\n", "<br>")
            out.append(f'<tr><th class="rowh"><div class="subj">{subject["id"]}</div><div class="brief">{brief}</div></th>')
            out.extend(cell(subject["id"], column, prefix) for column in COLUMNS)
            out.append('</tr>')
        out.append('</tbody></table></div>')
    out.extend(['<script>', SCRIPT, '</script></body></html>'])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    # Atomic publication lets independent round-completion hooks regenerate safely.
    with tempfile.NamedTemporaryFile(mode="w", dir=OUTPUT.parent, suffix=".html", delete=False) as handle:
        handle.write("\n".join(out))
        temporary = Path(handle.name)
    temporary.chmod(0o644)
    temporary.replace(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
