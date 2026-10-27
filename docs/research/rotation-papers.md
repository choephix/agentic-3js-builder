LLMs/VLMs are measurably weak at orientation when a task requires a change of viewpoint, a 3D/object-centric frame, or clockwise versus counter-clockwise discrimination. [3DSRBench](https://arxiv.org/html/2412.07825) · [RotBench](https://arxiv.org/html/2508.13968)
The cleanest orientation evidence is RotBench: GPT-4o correctly called only 52/300 clockwise cases, while 90°/270° confusion persisted despite captions, depth maps, segmentation, and chain-of-thought. [RotBench](https://arxiv.org/html/2508.13968)
3DSRBench reports GPT-4o orientation accuracy of 21.6% (versus 97.7% for humans), and a 13.5% relative drop when the same 3D scenes are rendered from uncommon camera viewpoints. [3DSRBench](https://arxiv.org/html/2412.07825)
For code-generated 3D, the papers reviewed here usually report aggregate geometric validity/Chamfer/constraint scores—not a dedicated count of sign, mirror, handedness, or Euler-angle errors. [INFERENCE] [CAD-Coder](https://arxiv.org/html/2505.19713) · [SceneCraft](https://arxiv.org/html/2403.01248) · [3D-PreMise](https://arxiv.org/html/2401.06437)
The strongest measured fixes in this set are executable geometry/render feedback, explicit 3D depth/regions/axes, and relational constraints; plain chain-of-thought is mixed and should not be treated as a reliable rotation fix. [INFERENCE] [CAD-Coder](https://arxiv.org/html/2505.19713) · [SpatialPIN](https://arxiv.org/html/2403.13438) · [RotBench](https://arxiv.org/html/2508.13968)

# Findings

## 1. What the orientation literature measures

### What’s “up” with vision-language models? (Kamath, Hessel & Chang, EMNLP 2023)

**Measured.** What’sUp contains 205 controlled four-image sets (820 images), where object identity and camera are held nearly constant while the relation changes; the model selects a caption differing only in a spatial preposition. Human estimates are 100% on What’sUp, 97.3% on COCO-spatial, and 99% on GQA-spatial. Across 18 VL models, BLIP fine-tuned on VQAv2 reaches only 56% average accuracy versus humans at 99%; BLIP-VQA is 56.0% on the three-benchmark average, and the best listed model (XVLM-COCO) is 60.4%. What’sUp itself is especially hard: BLIP-VQA is 47.8%, while random is 25%. [Paper](https://arxiv.org/html/2310.19785)

**Orientation-specific finding.** The benchmark directly tests left/right and front/behind, but it is primarily 2D/viewer-frame relation understanding rather than 6-DoF object pose. The authors find common spatial prepositions occur in less than 0.2% of LAION-2B captions and may use inconsistent reference frames (viewer versus subject). [Paper](https://arxiv.org/html/2310.19785)

**Fix measured.** Fine-tuning on 300,000 COCO/GQA spatial examples raises the CLIP ViT-B/32 average from 41.8% to 50.0% (+8.2 points), and raises COCO-spatial/GQA-spatial by an average of 14.6 points, but lowers What’sUp by 4.3 points. Caption-prior normalization does not drastically help. Replacing “behind” with the more frequent “in the background” raises CLIP ViT-B/32 and ViT-L/14 from an average 52% to 67% on that narrow case (+15 points), but the authors explicitly say it is not a general solution. [Paper](https://arxiv.org/html/2310.19785)

**Interpretation.** This is evidence for a spatial-relation/reference-frame problem, not evidence that a particular three.js sign convention is the cause. [INFERENCE]

### Failures in Perspective-taking of Multimodal AI Systems (Leonard, Woodard & Murray, 2024)

**Measured.** GPT-4o was tested on Level-1 visibility and Level-2 perspective-taking tasks at eight avatar angles (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°), with ten iterations per image. Level 2 asks whether a cube is to the avatar’s left/right or how a rotated symbol is seen. GPT-4o performs well on Level 1 but “struggled” once mental rotation was involved, beginning around a 90° angular difference; it showed a response bias at 90°/135°. [Paper](https://arxiv.org/html/2409.13929)

**Fix measured.** Chain-of-thought significantly improves GPT-4o on 180° stimuli, but does not improve intermediate rotations between 90° and 180°. The paper does not provide one scalar overall before/after percentage in the HTML results, so no stronger number should be inferred. [Paper](https://arxiv.org/html/2409.13929)

**Vocabulary.** The paper uses _perspective-taking_, _Level 1/Level 2_, _egocentric bias_, and _mental rotation_, rather than “Euler-angle error” or “handedness error.” [Paper](https://arxiv.org/html/2409.13929)

### Mind the Gap: Benchmarking Spatial Reasoning in Vision-Language Models (Stogiannidis, McDonagh & Tsaftaris, 2025)

**Measured.** This benchmark has 1,800 image-question pairs and evaluates 13 VLMs over paper folding, MRT Easy, MRT Hard, navigation, orientation, and spatial relations. Its MRT subsets have 200 examples each; random baselines are 33.33% (MRT Easy) and 25% (MRT Hard). GPT-4o obtains 32.5% MRT Easy and 20.0% MRT Hard; its orientation score is 72.5%, while overall chance after weighting all subsets is 32.37%. Across models, hard-MRT scores cluster around 20–29%, near chance. [Paper](https://arxiv.org/html/2503.19707)

**Orientation-specific finding.** The authors define orientation/navigation in egocentric terms, including Front, Back, Left, Right, Front-Left, Front-Right, Back-Left, and Back-Right. This separates ordinary scene relation recognition from mental rotation and viewpoint translation. [Paper](https://arxiv.org/html/2503.19707)

**Fix measured.** No intervention is evaluated in this paper; it is a diagnostic benchmark. The paper reports that simply doing well on easier orientation or natural-image tasks does not imply robust mental rotation. [Paper](https://arxiv.org/html/2503.19707)

### 3DSRBench: A Comprehensive 3D Spatial Reasoning Benchmark (Ma et al., ICCV 2025)

**Measured.** 3DSRBench contains 2,772 manually annotated VQA pairs across 12 question types: 2,100 natural MS-COCO pairs and 672 paired HSSD synthetic-view pairs. Its orientation category asks which side faces the camera, whether one object is in front/behind another, and whether an object is on another’s left/right _from the object’s perspective_. It uses CircularEval and FlipEval to reduce answer-order and left/right priors. On the real split, humans score 97.7% orientation; GPT-4o scores 21.6%; Qwen2.5-VL-7B 40.6%; SpatialReasoner 55.2%. The overall GPT-4o score is 44.2%. [Paper](https://arxiv.org/html/2412.07825)

**Viewpoint result.** On paired synthetic scenes, GPT-4o orientation falls from 17.7% on common viewpoints to 15.6% on uncommon viewpoints (13.5% relative overall drop; the paper’s reported relative-drop column). Gemini-1.5-Pro’s overall score drops 32.2%. This is a direct measurement of camera-frame/viewpoint sensitivity, not a claim about code syntax. [Paper](https://arxiv.org/html/2412.07825)

**Fix measured.** In a controlled encoder ablation, adding DINOv2 to CLIP raises orientation from 27.7% to 28.7%; using a spatial visual aggregator with the mixed encoder gives 26.5% in that table, while overall benchmark accuracy rises from 36.8% to 37.8%. This is a modest architecture effect, not a solved orientation procedure. The authors argue that explicit 3D-aware features and representations are needed; that causal explanation is their interpretation, not a proof of a particular sign bug. [Paper](https://arxiv.org/html/2412.07825)

**Vocabulary.** The paper uses _3D spatial reasoning_, _object perspective_, _camera 6D viewpoint_, _orientation_, _FlipEval_, _CircularEval_, and _explicit 3D representation_. [Paper](https://arxiv.org/html/2412.07825)

### RotBench: Evaluating Multimodal Large Language Models on Identifying Image Rotation (Niu et al., 2025/2026)

**Measured.** RotBench has 350 manually filtered images (300-image large split and 50-image small split), each tested at 0°, 90°, 180°, and 270°; chance is 25%. On RotBench-large, GPT-4o zero-shot is 0.99 at 0°, 0.69 at 90°, 0.93 at 180°, and 0.19 at 270°. Its confusion analysis counts 459 90° images misclassified as 270° and 424 270° images misclassified as 90° across three runs. In a binary clockwise/counter-clockwise test, GPT-4o correctly identifies only 52/300 clockwise rotations; Qwen-2.5-VL-7B correctly identifies 23/300. Humans average at least 0.97 on all rotations in the human subset. [Paper](https://arxiv.org/html/2508.13968)

**Orientation-specific finding.** Models recognize upright and often upside-down images but fail to reliably distinguish 90° from 270°—the exact clockwise/counter-clockwise or mirror-direction failure most analogous to a sign/handedness slip. This paper calls it difficulty distinguishing _clockwise from counter-clockwise rotations_ and a bias toward 90° counter-clockwise, not “Euler-angle error.” [Paper](https://arxiv.org/html/2508.13968)

**Fixes measured.** Captions, bounding boxes, scene graphs, depth maps, segmentation, and CoT are small/inconsistent. For GPT-4o, a rotation grid raises 90° from 0.69 to 0.71 but leaves 270° at 0.19; a guided grid raises 270° to 0.41. On the 50-image small split, Gemini-2.5-Pro rises from 0.50/0.40 at 90°/270° zero-shot to 0.71/0.74 with a guided rotation grid; o3 rises from 0.45/0.48 to 0.31/0.75 in the guided-grid row (90° worsens). Fine-tuning substantially improves 180° recognition but does not solve 90° versus 270°. [Paper](https://arxiv.org/html/2508.13968)

### SpatialRGPT: Grounded Spatial Reasoning in Vision-Language Models (Cheng et al., NeurIPS 2024)

**Measured.** SpatialRGPT-Bench has 657 qualitative and 749 quantitative VQA pairs over indoor, outdoor, and simulated 3D scenes. It trains on region-grounded 3D scene graphs and adds a depth connector. On qualitative relations, GPT-4V scores 46.67% for left/right and 45.45% for behind/front; SpatialRGPT-VILA-1.5-8B scores 100.0% left/right and 90.90% behind/front. On quantitative direction, GPT-4V succeeds 43.9% of the time (within ±25% of ground truth), while SpatialRGPT-VILA-1.5-8B succeeds 95.3%. [Paper](https://arxiv.org/html/2406.01584)

**Fix measured.** Region grounding plus 3D/depth-aware training is a large measured improvement, but it is a trained model comparison rather than a prompt-only intervention. The authors report 8.7M spatial concepts grounded in 5M regions. On BLINK Relative Depth, GPT-4V-Turbo is 66.9%, SpatialRGPT-7B 82.3%, and SpatialRGPT-VILA-1.5-8B 87.9%. [Paper](https://arxiv.org/html/2406.01584)

**Relevance to code builders.** This supports feeding explicit object regions, depth, axes, and relations to a code-writing model instead of asking it to infer all frames from prose. Applying that recommendation to three.js is an engineering extrapolation, marked [INFERENCE].

### SpatialPIN: Enhancing Spatial Reasoning Capabilities through Prompting and Interacting 3D Priors (Ma et al., 2024)

**Measured.** SpatialPIN reconstructs explicit 3D object poses/axes and injects those facts into prompts without fine-tuning. On qualitative intra-image orientation/relationship VQA, GPT-4V improves from 70.7% to 86.3%, GPT-4o from 69.0% to 87.3%, LLaVA-1.5 from 70.0% to 83.0%, and InstructBLIP from 62.3% to 79.3%. For angular-discrepancy VQA, GPT-4o improves from 68% to 84%; for inter-image spatial dynamics, from 64% to 82%. [Paper](https://arxiv.org/html/2403.13438)

**Fix measured.** Explicit scene size, canonical camera perspective, metric depth, object poses, principal axes, and axis visualizations provide a measured prompt-time improvement. The paper notes a remaining failure mode: models sometimes confuse camera and world coordinate frames when comparing object axes across images. [Paper](https://arxiv.org/html/2403.13438)

## 2. LLM-written CAD/3D code: what is and is not measured

### 3D-PreMise: Can Large Language Models Generate 3D Shapes with Sharp Features and Parametric Control? (Yuan et al., 2024)

**Measured.** The benchmark has 57 rigid industrial-style objects and uses executable Blender Python plus point-cloud matching. GPT-4 Pass@1 is 7.0% zero-shot, 5.3% zero-shot CoT, 12.3% one-shot, 12.3% few-shot, and 17.5% one-shot CoT. Thus an explicit worked example plus CoT improves pass@1 from 7.0% to 17.5% (+10.5 points), while prompting with guiding questions alone does not help. [Paper](https://arxiv.org/html/2401.06437)

**Orientation-specific evidence and limitation.** The paper identifies the core challenge as assembling parts in one coordinate system and performing geometric/trigonometric calculations, and its generated scripts use translation, scaling, and rotation. However, its reported error categories are syntax, geometric, and commonsense errors; it does not publish a count of sign flips, mirrored parts, wrong handedness, degrees/radians, Euler order, or wrong rotation axis. The benchmark’s point-cloud metric deliberately normalizes away position and orientation before geometry comparison, so it is not an orientation-accuracy metric. [Paper](https://arxiv.org/html/2401.06437)

**Implication.** A low CAD pass rate establishes that parametric code generation is hard, but cannot by itself prove that orientation is the dominant failure. [INFERENCE]

### SceneCraft: An LLM Agent for Synthesizing 3D Scene as Blender Code (Hu et al., ICML 2024)

**Measured.** SceneCraft uses a relational scene graph, constraint functions, Blender renders, GPT-V review, and library learning. On 20 held-out synthetic queries, BlenderGPT scores 5.6 constraint score and SceneCraft 88.9; CLIP similarity is 24.7 versus 69.8. Removing the inner-loop visual feedback reduces constraint score to 26.1 (a 38.4-point drop); removing the relation graph gives 3.2; removing the learned library gives 64.5. Human pairwise win rates favor SceneCraft over BlenderGPT 83.6% on composition/constraint agreement. [Paper](https://arxiv.org/html/2403.01248)

**Orientation-specific evidence.** The system explicitly predicts layout matrices containing position, scale, and orientation, and its learned `parallelism` relation was updated to include orientation similarity. But the aggregate constraint score does not isolate orientation errors, so the paper does not quantify how many wrong-way spikes/roofs/stripes were fixed. [Paper](https://arxiv.org/html/2403.01248)

**Fix measured.** Relational constraints and rendered visual feedback are strongly supported as system-level fixes; the result is not evidence that scene graphs alone fix Euler signs. [INFERENCE]

### BlenderGym: Benchmarking Foundational Model Systems for Graphics Editing (Gu et al., 2025)

**Measured.** BlenderGym has 245 hand-crafted start/goal tasks across object placement (40), lighting (40), procedural material (75), blend shapes (40), and procedural geometry (50). Object placement includes 3D position changes; lighting includes location and orientation, including lights inferred from shadows. For GPT-4o, placement has N-CLIP 30.38 and Chamfer distance 11.22; human placement is N-CLIP 13.34 and CD 1.532. Human/VLM verifier alignment is 0.79 between humans versus 0.66 for the best listed VLM (Claude-3.5-Sonnet). [Paper](https://arxiv.org/html/2504.01786)

**Fix measured.** The benchmark’s system uses generation plus a visual verifier. Scaling verifier queries monotonically improves all three selected-edit metrics in their experiment; at higher total query budgets, allocating a larger share to verification ranks better (VeriRatio 0.73 beats lower ratios when total queries exceed 100). The paper does not report a rotation-only success rate, so this is evidence for feedback/verification on graphics editing generally, not a dedicated orientation number. [Paper](https://arxiv.org/html/2504.01786)

**Practical relevance.** The authors manually select at least three render views for every 3D-related task and use two views as VLM input, an explicit response to occlusion and viewpoint ambiguity. This is a design choice, not an ablation proving exactly how much multi-view rendering fixes rotation. [Paper](https://arxiv.org/html/2504.01786)

### Text2CAD: Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts (Khan et al., NeurIPS 2024)

**Measured.** Text2CAD generates sketch/extrusion sequences from four prompt detail levels. For expert prompts, its F1 is 81.13 (line), 36.03 (arc), 74.25 (circle), and 93.31 (extrusion), with mean Chamfer distance 26.41×10^-3 and invalidity ratio 0.93%; DeepCAD’s mean CD is 97.93×10^-3 and IR 10.00%. Its adaptive layer improves arc F1 by 32.56% relative to the no-adaptive-layer variant and reduces invalidity by about 2.9×. [Paper](https://arxiv.org/html/2409.17106)

**Orientation-specific evidence and limitation.** CAD tokens include extrusion parameters such as Euler angles and translation vectors, so the representation contains orientation parameters. Nevertheless, the published evaluation aggregates primitive/extrusion F1, Chamfer distance, invalidity, GPT-4V preference, and user preference; it does not classify Euler sign, mirrored sketch, handedness, or wrong-axis failures. The authors do report sensitivity to perspective distortion in multi-view image descriptions. [Paper](https://arxiv.org/html/2409.17106)

### CAD-Coder: Text-to-CAD Generation with Chain-of-Thought and Geometric Reward (Guan et al., NeurIPS 2025)

**Measured.** CAD-Coder generates executable CadQuery Python and trains with supervised fine-tuning (SFT), chain-of-thought cold start, and GRPO using Chamfer-distance plus format rewards. On its test set, GPT-4o has mean CD 133.52×10^-3 and invalidity 93.00%; Text2CAD has mean CD 29.29×10^-3 and invalidity 3.75%; CAD-Coder has mean CD 6.54×10^-3 and invalidity 1.45%. In the ablation, SFT alone has mean CD 74.55 and IR 5.33%; adding GRPO without CoT gives 17.34 and 4.95%; the full system gives 6.54 and 1.45%. [Paper](https://arxiv.org/html/2505.19713)

**Fix measured.** Geometry-aware execution and reward are the clearest quantitative fix in the CAD-code literature: full training cuts mean CD from 74.55 to 6.54 and IR from 5.33% to 1.45%. CoT contributes in the comparison from GRPO-without-CoT (17.34) to full (6.54), but CoT is coupled to the full training setup; this is not a pure prompt-only test. [Paper](https://arxiv.org/html/2505.19713)

**Orientation-specific evidence and limitation.** CoT explicitly asks the model to assign coordinate systems, decompose components, design sketches, and plan extrusions. Still, the paper reports aggregate geometric/validity metrics rather than a sign/mirror/Euler-error taxonomy. [Paper](https://arxiv.org/html/2505.19713)

### LL3M: Large Language 3D Modelers (Lu et al., 2025)

**Measured.** LL3M is a Blender-code multi-agent system with planner, retrieval, coder, critic, verification, and user-feedback agents. It uses BlenderRAG built from 1,729 Blender 4.4 documentation files and renders five views for critic/verification. In a 17-object analysis, BlenderRAG produces a 5× increase in the number of complex Blender operations without increasing execution-error problems; the paper states that ultimately all execution errors are corrected by the system. [Paper](https://arxiv.org/html/2508.08228)

**Orientation-specific evidence and limitation.** The paper gives qualitative examples of correct orientation (for example, whiskers and connected parts) and describes visual criticism of disconnected geometry, but does not provide a numeric orientation-error rate or sign/mirror/Euler category. Its evidence supports retrieval plus render/repair for executable 3D code generally, not a measured claim that RAG fixes rotation direction. [Paper](https://arxiv.org/html/2508.08228)

# What researchers call this failure

- **Spatial reasoning / spatial understanding:** umbrella terms for positions, orientations, and relations. [3DSRBench](https://arxiv.org/html/2412.07825), [Mind the Gap](https://arxiv.org/html/2503.19707)
- **Spatial orientation and navigation:** often separated from mental rotation and spatial relations. [Mind the Gap](https://arxiv.org/html/2503.19707)
- **Mental rotation:** deciding whether a 2D/3D object is the same object after rotation versus a mirror image. [Mind the Gap](https://arxiv.org/html/2503.19707)
- **Perspective-taking / Level-2 perspective-taking:** translating relations into another observer’s frame; failures show up as egocentric bias. [Leonard et al.](https://arxiv.org/html/2409.13929)
- **Egocentric versus allocentric reference frames:** relation to the observer versus relation among landmarks/objects. [Mind the Gap](https://arxiv.org/html/2503.19707)
- **Object-centric orientation / 3D spatial reasoning:** the 3DSRBench term for front/behind/left/right from an object’s own orientation rather than screen space. [3DSRBench](https://arxiv.org/html/2412.07825)
- **Clockwise versus counter-clockwise rotation; 90°/270° confusion:** RotBench’s directly measured directional failure. [RotBench](https://arxiv.org/html/2508.13968)
- **Camera 6D viewpoint / uncommon viewpoint robustness:** viewpoint changes expose frame-translation failures. [3DSRBench](https://arxiv.org/html/2412.07825)
- **Region grounding, depth-aware spatial reasoning, and 3D scene graphs:** terms for fixes that make object identity, axes, and depth explicit. [SpatialRGPT](https://arxiv.org/html/2406.01584)
- **Geometric fidelity, Chamfer distance, invalidity ratio, constraint satisfaction:** common code/CAD evaluation terms. They measure consequences of wrong geometry, but usually do not identify the particular rotation/sign cause. [CAD-Coder](https://arxiv.org/html/2505.19713), [3D-PreMise](https://arxiv.org/html/2401.06437), [SceneCraft](https://arxiv.org/html/2403.01248)

Across the sources above, _sign error_, _handedness error_, _Euler-order error_, _degrees/radians error_, and _mirroring error_ are not used as a standard, consistently reported CAD-code error taxonomy. “Mirror image,” “left/right,” “clockwise/counter-clockwise,” “object perspective,” and “camera/world frame” are the closest established diagnostic vocabulary. [INFERENCE from the reported taxonomies and metrics in the cited papers.]

# Ranked fixes with measured evidence

1. **Execute and score geometry, then repair or optimize against the rendered/3D result.** CAD-Coder’s geometry-aware GRPO plus CoT reduces mean CD from 74.55 to 6.54 and invalidity from 5.33% to 1.45% versus SFT alone. SceneCraft’s render-review inner loop raises constraint score from 26.1 without it to 88.9 with it; BlenderGym likewise finds scaled visual verification improves selected edits. These are the strongest code-generation results, although none isolates orientation alone. [CAD-Coder](https://arxiv.org/html/2505.19713) · [SceneCraft](https://arxiv.org/html/2403.01248) · [BlenderGym](https://arxiv.org/html/2504.01786)

2. **Provide explicit 3D priors: depth, object regions, canonical camera frame, principal axes, and pose relationships.** SpatialPIN raises GPT-4o qualitative spatial accuracy 69.0%→87.3%, angular VQA 68%→84%, and inter-image dynamics 64%→82%. SpatialRGPT reaches 100.0% left/right versus GPT-4V’s 46.67% on its benchmark and 87.9% versus 66.9% on BLINK Relative Depth. This is the best measured evidence for replacing mental angle arithmetic with grounded directions/frames. [SpatialPIN](https://arxiv.org/html/2403.13438) · [SpatialRGPT](https://arxiv.org/html/2406.01584)

3. **Use relational constraints/scene graphs or endpoint/direction primitives instead of unconstrained absolute transforms.** SceneCraft’s relation-graph ablation scores 88.9 with the full system versus 3.2 without the relation graph; its learned parallelism constraint explicitly adds orientation similarity. The evidence is strong for relational layout but does not prove a specific three.js `rotation` sign fix. [SceneCraft](https://arxiv.org/html/2403.01248) [INFERENCE when applying this to a three.js SDK]

4. **Use multiple views and a verifier, especially for rotations hidden by one camera.** BlenderGym fixes at least three evaluation views for every 3D task and finds verifier alignment improves with query scaling; LL3M renders five views for critic/verification. RotBench’s rotation grid can help reasoning models (Gemini-2.5-Pro 90°/270°: 0.50/0.40→0.71/0.74) but can hurt weaker models, so multi-view is a measured but model-dependent fix. [BlenderGym](https://arxiv.org/html/2504.01786) · [LL3M](https://arxiv.org/html/2508.08228) · [RotBench](https://arxiv.org/html/2508.13968)

5. **Use worked examples and structured reasoning, but do not rely on generic CoT alone.** 3D-PreMise one-shot CoT raises GPT-4 Pass@1 7.0%→17.5%; CAD-Coder’s full system beats its no-CoT GRPO ablation (mean CD 17.34→6.54), but these are coupled with examples/training/reward. RotBench reports CoT as mixed on 90°/270°, and Leonard et al. find CoT helps 180° but not intermediate angles. [3D-PreMise](https://arxiv.org/html/2401.06437) · [CAD-Coder](https://arxiv.org/html/2505.19713) · [RotBench](https://arxiv.org/html/2508.13968) · [Perspective-taking](https://arxiv.org/html/2409.13929)

6. **Add targeted spatial training with balanced opposite relations and hard negatives.** What’sUp shows in-distribution COCO/GQA fine-tuning can add 14.6 points but lowers controlled What’sUp by 4.3 points; hard negatives were difficult to fit. 3DSRBench’s FlipEval is a useful evaluation design against left/right priors, while SpatialRGPT’s large region/depth training is a more successful specialized-training example. [What’sUp](https://arxiv.org/html/2310.19785) · [3DSRBench](https://arxiv.org/html/2412.07825) · [SpatialRGPT](https://arxiv.org/html/2406.01584)

# Search terms that worked

- `LLM spatial reasoning mental rotation benchmark left right mirror`
- `VLM perspective taking egocentric bias angular rotation`
- `3D spatial reasoning benchmark object-centric orientation front behind left right`
- `camera 6D viewpoint uncommon viewpoint VLM orientation`
- `clockwise counter-clockwise 90 270 rotation multimodal benchmark`
- `LLM Blender Python code generation benchmark visual feedback constraint score`
- `text-to-CAD executable code geometric reward Chamfer distance invalidity ratio`
- `CAD-Coder CadQuery chain-of-thought geometric reward`
- `SceneCraft Blender code relational scene graph orientation constraint`
- `BlenderGym graphics editing verifier scaling placement lighting orientation`
- `3D-PreMise Blender Python parametric modeling Pass@1 chain-of-thought`
- `LL3M BlenderRAG critic verification multi-view code generation`
- `SpatialRGPT depth region grounding spatial reasoning benchmark`
- `SpatialPIN explicit 3D priors axes perspective canonicalization`

# Sources

1. Kamath, Hessel & Chang. “What’s ‘up’ with vision-language models? Investigating their struggle with spatial reasoning.” EMNLP 2023. https://arxiv.org/html/2310.19785
2. Leonard, Woodard & Murray. “Failures in Perspective-taking of Multimodal AI Systems.” 2024. https://arxiv.org/html/2409.13929
3. Stogiannidis, McDonagh & Tsaftaris. “Mind the Gap: Benchmarking Spatial Reasoning in Vision-Language Models.” 2025. https://arxiv.org/html/2503.19707
4. Ma et al. “SpatialPIN: Enhancing Spatial Reasoning Capabilities of Vision-Language Models through Prompting and Interacting 3D Priors.” 2024. https://arxiv.org/html/2403.13438
5. Cheng et al. “SpatialRGPT: Grounded Spatial Reasoning in Vision-Language Models.” 2024. https://arxiv.org/html/2406.01584
6. Ma et al. “3DSRBench: A Comprehensive 3D Spatial Reasoning Benchmark.” ICCV 2025. https://arxiv.org/html/2412.07825
7. Niu, Cho, Stengel-Eskin & Bansal. “RotBench: Evaluating Multimodal Large Language Models on Identifying Image Rotation.” 2025/2026. https://arxiv.org/html/2508.13968
8. Yuan et al. “3D-PreMise: Can Large Language Models Generate 3D Shapes with Sharp Features and Parametric Control?” 2024. https://arxiv.org/html/2401.06437
9. Hu et al. “SceneCraft: An LLM Agent for Synthesizing 3D Scene as Blender Code.” ICML 2024. https://arxiv.org/html/2403.01248
10. Gu et al. “BlenderGym: Benchmarking Foundational Model Systems for Graphics Editing.” 2025. https://arxiv.org/html/2504.01786
11. Khan et al. “Text2CAD: Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts.” NeurIPS 2024. https://arxiv.org/html/2409.17106
12. Guan et al. “CAD-Coder: Text-to-CAD Generation with Chain-of-Thought and Geometric Reward.” NeurIPS 2025. https://arxiv.org/html/2505.19713
13. Lu et al. “LL3M: Large Language 3D Modelers.” 2025. https://arxiv.org/html/2508.08228
