# Vanguard — old concepts revisited

2026 portfolio extension of the supplied medieval concept. Original date and game affiliation are unconfirmed. Three companion images were created with the built-in image generation tool; the supplied reference is preserved unchanged. This is a visual critique and proposed UX design, not a shipped project or completed research.

## Deliverables

- portfolio-imgs/vanguard/original.png — supplied reference.
- portfolio-imgs/vanguard/class-selection.png — role and named equipment.
- portfolio-imgs/vanguard/loadout.png — comparison, preview and lock states.
- portfolio-imgs/vanguard/deployment.png — review and explicit deployment.
- portfolio-showcase.html#vanguard/flow — rationale and proposed validation.
- portfolio-showcase.html#vanguard/prototype — interactive state walkthrough including cancellation and join recovery.

## Rationale and scope

The source's repeated 9 ratings lack a visible scale; rank resembles a combat trait; equipment lacks names and state labels. The revisit clarifies these decisions while preserving the art direction. Qualitative traits, rank requirements and match details are illustrative. Heavy armor may conflict with the low-protection trait; validate or revise the silhouette. The React prototype now explores four classes with separate assets, shared equipment state, and a fixed-ratio layout; see VANGUARD_REACT.md. There is no live game connection or persistent save. Generated screens are mockups: implementation would require native text, localization, accessible components and controller focus.

## Proposed validation

Ask 5–6 players of mixed genre familiarity to explain the role, cancel a preview, inspect a lock, equip, and recover from a failed join. Observe wrong-state interpretations, accidental changes and completion without prompting. Check keyboard focus recovery and TV-distance readability. No outcomes are claimed.

## Generation prompts

### Screen 1

Use case: ui-mockup. Create one polished full-screen 16:9 medieval multiplayer game interface, no device frame, for a portfolio concept revisiting the attached design. Input image 1 is a visual style reference only. Match its cinematic realistic steel armor, blue cloth, crimson banners, smoky castle at golden dusk, black translucent panels, fine antique gold borders and diamond ornaments, ivory serif titles. Maintain high legibility, generous spacing, disciplined hierarchy. New companion screen, not a collage. Screen: revised CLASS SELECTION. Top breadcrumb 'PREPARE / CLASS'. Four top tabs ARCHER, VANGUARD, FOOTMAN, KNIGHT; VANGUARD selected with gold underline and diamond. Center-right magnificent armored blue-plumed polearm knight against castle; leave far left clean reading space. Left title 'VANGUARD', subtitle 'Reach & pressure', description 'Control space with long-reaching weapons.' Three clearly labelled horizontal attribute rows: 'Reach  HIGH', 'Mobility  MEDIUM', 'Protection  LOW'. Small readable footer below attributes 'Relative class traits'. Bottom left panel heading 'ROLE TRADE-OFF', text 'Long reach. Vulnerable at close range.' Right restrained panel heading 'CURRENT LOADOUT' with beautiful distinct item thumbnails and names 'Halberd', 'Hatchet', 'War horn', status 'Equipped'. Bottom bar BACK on left, large crimson gold-trimmed primary button 'REVIEW LOADOUT' center, small 'Step 1 of 3' right. No class rank disguised as combat stat, no invented numerical ratings, no fight button on this step. Exact essential labels, polished shipped-game quality.

### Screen 2

Use case: ui-mockup. Create one polished full-screen 16:9 medieval multiplayer game interface, no device frame, for a portfolio concept revisiting the attached design. Input image 1 is a visual style reference only. Match its cinematic realistic steel armor, blue cloth, crimson banners, smoky castle at golden dusk, black translucent panels, fine antique gold borders and diamond ornaments, ivory serif titles. Maintain high legibility, generous spacing, disciplined hierarchy. New companion screen, not a collage. Screen: ARMOURY / PRIMARY WEAPON. Top breadcrumb 'PREPARE / LOADOUT', small 'VANGUARD'. Three-part composition: left 25% width equipment collection with three tall illustrated weapon cards 'HALBERD' marked EQUIPPED, 'POLEAXE' marked PREVIEW and gold selection border, 'GLAIVE' marked LOCKED and smaller 'Requires class rank 4'. Center 40% beautiful large full-length poleaxe weapon render in a shadowy castle armoury with warm embers and blue cloth, no person needed. Right 30% dark comparison panel title 'POLEAXE', subtitle 'Preview only'. Table heading 'HALBERD → POLEAXE'; rows 'Reach: High → Medium', 'Speed: Low → Medium', 'Impact: Medium → High'. Below text 'Your halberd stays equipped until you apply.' bottom comparison buttons 'CANCEL PREVIEW' secondary and 'EQUIP POLEAXE' primary crimson/gold. Bottom bar 'BACK TO CLASS' left and 'Step 2 of 3' right. A subtle label 'Illustrative weapon traits'. Respect realistic physical medieval axe forms, no guns. All text readable and correctly spelled. One cohesive beautiful UX screen.

### Screen 3

Use case: ui-mockup. Create one polished full-screen 16:9 medieval multiplayer game interface, no device frame, for a portfolio concept revisiting the attached design. Input image 1 is a visual style reference only. Match its cinematic realistic steel armor, blue cloth, crimson banners, smoky castle at golden dusk, black translucent panels, fine antique gold borders and diamond ornaments, ivory serif titles. Maintain high legibility, generous spacing, disciplined hierarchy. New companion screen, not a collage. Screen: final DEPLOYMENT REVIEW. Top breadcrumb 'PREPARE / DEPLOY', 'Step 3 of 3'. Left third dark panel large heading 'READY FOR BATTLE', subtitle 'Review your selection'. Stacked labelled fields 'TEAM / RED COMPANY', 'CLASS / VANGUARD', 'PRIMARY / POLEAXE', 'SECONDARY / HATCHET', 'SUPPORT / WAR HORN'. Small explicit confirmation 'Loadout updated' with a check symbol. Secondary outlined button 'EDIT LOADOUT'. Center glorious full body blue-plumed plate-armored knight holding poleaxe before castle drawbridge, crimson faction banners, warm golden smoke. Right third elegant gold-bordered panel title 'CASTLE SIEGE', subtitle 'Team objective', beautiful landscape miniature of castle, short mission text 'Join your team at the castle gates.' Beneath 'Joining begins when you deploy.' Bottom bar 'BACK' left, large main crimson antique gold button 'DEPLOY' center, subdued 'SPECTATE' right. No countdown or immediate automatic joining, no invented live multiplayer counts. Make every label legible; restrained gold ornament and no modern rounded UI. New matching screen.
