# UX portfolio studies

Six retrospective walkthroughs connect the original screens to player goals, decisions, feedback, recovery paths, and future validation questions. They do not assert historical research or measured outcomes.

Three new HTML prototypes use illustrative rules: repair approval and budget recovery; squad readiness, cancellation, and reconnection; deck validation and edit preservation. These are new portfolio extensions, not original shipped screens. AI environments are labelled in every prototype. The supplied screens remain intact and accessible from each walkthrough.

## Verification

`node --test tests/portfolio-ux.test.cjs` passes five checks covering original-asset references, state reachability, repair confirmation, connection recovery, and deck validation. Browser checks exercised all six walkthroughs and their four steps, original-screen links, prototype actions and reset, deep-link reloads, and layouts at 1440, 390, and 320 pixels. No browser console errors were observed. Changes are local and have not been published.

## Image provenance and prompts

Generated with the built-in image generation tool on 2026-09-22. Unmodified PNG outputs are saved in portfolio-imgs/ux. Interface text, controls, and flows are HTML, not baked into the artwork.

### hangar

Saved asset: [repair-hangar.png](portfolio-imgs/ux/repair-hangar.png)

Prompt:

Use case: stylized-concept. Asset type: supporting concept art inside a game UX portfolio's interactive repair-decision prototype. Create a premium cinematic hard-surface science-fiction repair hangar, a single heavy industrial bipedal battle mech standing offline in a maintenance cradle, technicians tiny for scale, visible open knee actuator with warm amber work lights, cool desaturated forest-green and charcoal environment, faint steam, worn brushed metal and realistic cables. Wide 16:9 composition, mech occupies right two-thirds, left third relatively quiet and dark for overlay UI. Grounded tactical game art, rich but restrained detail, sharp realistic 3D rendering, strong readable silhouette. This is an original mech design, not an existing franchise's exact robot. NO text, no letters, no UI, no logos, no watermark, no graphic borders. High quality final concept art.

### staging

Saved asset: [squad-staging.png](portfolio-imgs/ux/squad-staging.png)

Prompt:

Use case: stylized-concept. Asset type: supporting concept art inside an interactive multiplayer readiness UX portfolio concept. Premium cinematic sci-fi squad staging room before a mission, three clearly distinct unbranded futuristic armored operatives standing at three illuminated staging bays, fourth bay intentionally EMPTY with a subtle blue light, futuristic industrial architecture with clean depth and atmosphere. Muted slate-blue, steel, charcoal and restrained warm white, realistic high-end game environment painting, characters shown full-body, no aggressive action. Wide 16:9 composition, squad at right two-thirds, left third quiet dark space suitable for UI overlay, geometric readable forms. Original character designs, no recognizable existing game characters. NO words, letters, text, UI elements, labels, logos, watermark, borders. Final polished game concept art.

### arcane

Saved asset: [arcane-workbench.png](portfolio-imgs/ux/arcane-workbench.png)

Prompt:

Use case: stylized-concept. Asset type: supporting concept art inside a fantasy card deck validation UX portfolio prototype. A premium painterly 3D fantasy card-builder workbench: carved dark walnut tabletop with aged brass inlays, a few ornate unlettered collectible cards showing tiny original mage and woodland-creature illustrations, one empty card slot subtly lit by soft golden light, arcane astrolabe and muted jade crystal, atmospheric blurred magical library in background. Warm parchment gold, deep chestnut, muted green, handcrafted elegant fantasy strategy game mood. Wide 16:9 composition, detailed objects clustered to right two-thirds, left third low contrast dark for interface copy. All cards must have NO text and no numbers. NO text anywhere, no logos, no interface, no watermark. Rich realistic materials with restrained magical lighting, polished final concept art.
