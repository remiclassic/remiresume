# Vanguard React reconstruction

The generic text walkthrough is replaced with React. Scene artwork, equipment, banner, map and panel material are separate PNG assets in `portfolio-imgs/vanguard/assets/`. Text, navigation, buttons, cards, traits, comparisons, borders and dialogs are live HTML/CSS/SVG. There is no flattened interface screenshot underneath the controls.

## Source and build
- `src/vanguard.jsx`: components, modal focus, keyboard handling, renderer lifecycle.
- `src/vanguard-state.js`: shared class/equipment state and transitions.
- `vanguard.css`: mockup-coordinate layout and visual styling.
- `vanguard.js`: committed production bundle for GitHub Pages.
- `portfolio-showcase.html#vanguard/prototype`: embedded case study.
- `vanguard.html`: full-window concept.
- Build: `npm ci && npm run build`. Test: `npm test`.

## Proportions and behavior
The logical canvas is 1672 × 941, matching the three mockups. ResizeObserver fits both dimensions with one scale factor. Extra space is letterboxed; the composition never stretches, crops, or rearranges into different columns. The full-window link and landscape orientation provide a larger view on small devices.

Four class tabs change character art, role, traits and available weapons. Preview never equips. Cancel preserves the current item and restores focus to its card. Locked items explain the class-rank requirement and cannot be equipped. Equip updates the deployment summary and character weapon artwork. Team changes retain the loadout and update the UI banner tint. Secondary and support cards open item detail dialogs.

Back, edit, reset, leave preparation, class/weapon arrow navigation, Escape, dialog focus containment and return paths are implemented. Deployment has joining, success, failed join and retry states. Spectate opens an explicit spectator preview. The portfolio toolbar includes a recovery scenario. Selections survive leaving and re-entering the embedded prototype while the page remains open. The React root is unmounted cleanly when another view is selected.

This is a preparation-interface demo, with illustrative traits and unlock rules. Deployment and spectator completion do not connect to a live game or implement combat. Original source screenshots remain unchanged.

## Validation
Dedicated React model tests replace the obsolete Vanguard text-graph tests. They cover preview/cancel/equip, locks, class and team retention, duplicate join prevention, failure/retry, scene changes, all referenced assets and canvas fitting.

Browser validation covers all three rendered layouts, all class tabs, item selection and comparison, cancellation, locks, equipment propagation, team selection, keyboard focus containment, join completion and recovery. Embedded viewport checks at 390 × 844 and 844 × 390 preserve 1672:941 and fit the complete canvas. Visual checks against the mockups corrected title placement, equipment scaling, panel opacity, borders and footer overlap.

## Asset prompts
Built-in image generation was used for all artwork edits/extractions and character variants. No fallback CLI or API key was used. The final assets are named below, all under `portfolio-imgs/vanguard/assets/`.


### class-scene.png
Reference: class-selection.png

Remove ALL user interface from this image: ALL lettering, texts, rectangular panels, trait bars, item cards, borders, top navigation and bottom navigation. Preserve the EXACT central blue-plumed armored character, pose, scale, placement, lighting, and castle composition. Reconstruct the smoky dark background on the left and castle scenery on the right behind removed UI. Remove the small hanging heraldry banner on left too, as it will be a separate UI asset. Keep the image full-bleed landscape exactly 1672 by 941 composition (16:9 approximately). This is a clean background scene asset for rebuilding this precise interface in React. NO TEXT, NO BUTTONS, NO PANELS, NO FRAMES. Retain central character precisely; do not redesign.

### armoury-scene.png
Reference: loadout.png

Remove ALL UI, all text, all cards and frames, and ALL foreground weapons including the big center poleaxe. Keep exactly the architectural medieval armoury background, arch and distant castle, braziers, banners, candles, stone floor and lighting. Reconstruct only areas hidden behind interface and weapons. Preserve original composition and camera; wide landscape 1672 by 941 proportion. Empty clear stone pedestal in center where weapon will be added separately. NO TEXT, NO ICONS, NO PANELS, NO BUTTONS. This is a clean environment layer for a faithful React reconstruction.

### deployment-scene.png
Reference: deployment.png

Remove ALL interface text, headers, navigation bars, left and right panels, icons and UI frames. Preserve EXACT central full-body blue-plumed armored knight holding poleaxe, its pose, position, scale, warm light, castle and background. Inpaint scenic castle/background only where interface was removed. No UI, no lettering, no panels. Retain wide landscape 1672 by 941 composition. Clean background artwork for exact React reconstruction; do not redesign central figure.

### halberd.png
Reference: loadout.png

Extract ONLY the HALBERD shown in the LEFTMOST weapon card, as a single isolated upright weapon, complete from blade tip to bottom of shaft. Preserve its exact silver blade shape, wooden brown shaft, metal details and rendering. Transparent background. Tall narrow canvas, weapon fills 90% of height centered. No UI, no card, no text, no border, no shadow plane.

### poleaxe.png
Reference: loadout.png

Extract ONLY the large CENTRAL POLEAXE as a single isolated upright complete weapon. Preserve exact silver axe blade, upper spear tip, decorative gold metal details, blue-black wrapped shaft. Transparent background, tall narrow canvas, weapon fills 90% of height centered. No UI, no pedestal, no text, no card, no border.

### glaive.png
Reference: loadout.png

Extract ONLY the GLAIVE weapon shown in the third LEFT weapon card, as a single isolated upright complete weapon. Preserve exact curved long silver blade, hooks, brown wooden shaft with wrapped grip. Transparent background, tall narrow canvas, weapon fills 90% of height centered. No lock symbol, no UI, no card, no lettering, no border.

### hatchet.png
Reference: class-selection.png

Extract ONLY the HATCHET shown in the middle equipment card on the right, as a single isolated complete axe. Preserve exact broad silver axe blade, dark metal bindings and wooden brown handle. Transparent background, tall narrow canvas, item fills 85% of height centered. No UI, no lettering, no border, no card.

### war-horn.png
Reference: class-selection.png

Extract ONLY the curved WAR HORN shown in bottom equipment card on right, as a single isolated item. Preserve exact ivory curved horn, ornate gold rim and gold end cap, little leather straps. Transparent background, portrait canvas, item fills 85% of height centered. No UI, no lettering, no card, no border.

### banner.png
Reference: class-selection.png

Extract ONLY the small red cloth heraldry banner on the upper left. Preserve the exact crimson fabric, ivory heraldic eagle, gold suspension bar and ragged pointed bottom. Transparent background, portrait canvas, flag fills 90% of height centered. No text, no UI, no other elements.

### castle-map.png
Reference: deployment.png

Extract ONLY the rectangular CASTLE SIEGE landscape illustration inside the right panel. Expand to fill the entire canvas with that exact castle drawing, detailed castle turrets, red banners, stone bridge and mountain valley in warm golden dusk. Portrait 4:5 composition as original inset. No text, no UI, no borders or frames.

### archer-scene.png
Reference: class-scene.png

Replace ONLY the central armored polearm knight with a medieval ARCHER in blue padded cloth, leather armour and steel open-faced helmet, holding a tall wooden longbow, quiver over shoulder. Keep EXACT character bounding region and placement center-right, identical scale as reference. Preserve all castle scenery, camera angle, dark empty left area, crimson banners, and lighting unchanged. No text or UI. Landscape 1672x941 composition.

### footman-scene.png
Reference: class-scene.png

Replace ONLY central armored knight with medieval FOOTMAN in blue padded surcoat and practical half-plate armor and open-face kettle helmet, holding a long wooden spear vertically. Same exact position, same scale, same light, same background. Keep left side empty dark for UI. Preserve castle backdrop and camera framing. No text or UI. Landscape 1672x941 composition.

### knight-scene.png
Reference: class-scene.png

Replace ONLY character equipment: medieval KNIGHT in heavy enclosed steel plate and blue cloth, ornate helmet with lower blue plume, holding a long two-handed silver longsword upright instead of polearm. Same exact central placement, scale, lighting. Keep scenery, castle, dark left area identical. No text or UI. Landscape 1672x941 composition.

### longbow.png
Reference: class-scene.png

Create a single medieval wooden longbow game inventory asset matching the steel, wood, leather and gold aesthetic of this reference. Tall curved warm wood bow, taut thin bowstring and dark leather grip, entire object visible. Isolate on truly transparent background, no shadows or opaque backdrop, no glow, no text or UI. Portrait canvas.

### spear.png
Reference: class-scene.png

Create a single medieval infantry spear game inventory asset matching this reference. Long slender warm wooden shaft, elongated silver steel leaf-shaped spearhead, small brass collar, leather grip. Entire upright object visible. Isolate on truly transparent background, no shadow, no glow, no text or UI. Portrait canvas.

### longsword.png
Reference: class-scene.png

Create a single medieval two-handed longsword game inventory asset matching reference steel armor. Beautiful long straight double-edged silver blade, brass crossguard, dark blue leather handle, gold pommel. Entire upright sword visible tip up. Isolate on truly transparent background, no shadow, no glow, no text or UI. Portrait canvas.

### panel-texture.png

Use case: precise-object-edit. Extract the DARK BLACK MARBLED MATERIAL from the right CURRENT LOADOUT panel of reference into a seamless square texture tile. Only the material, deep charcoal black stone with extremely subtle fine scratches and thin mineral veins, low contrast, matte worn finish, sophisticated medieval UI surface. Remove all lettering, items, frames, all gold decoration, all icons. Flat front view, no lighting gradient, no text. This asset repeats behind live HTML UI.

### deployment-halberd.png

Use case: precise-object-edit. Image 1 is the edit target, image 2 is the weapon reference. In image 1 change ONLY the poleaxe held by the knight to the HALBERD in image 2: warm brown wooden shaft and simpler silver broad axe blade with straight spear tip and back spike. Preserve hand grip and correct alignment. Keep character pose, proportions, all armor, placement, camera, castle and lighting EXACTLY unchanged. No UI or text. Same landscape composition as image1. This is the alternate equipped-weapon deployment background for a React game UI.

### footman-halberd.png
References: footman-scene.png, halberd.png

Use case: precise-object-edit. Image1 is edit target, Image2 is the replacement weapon. Replace ONLY the weapon held by the character in image1 with the halberd shown in image2, scaled correctly and held at the same grip with realistic alignment. Preserve character identity, exact pose, armor, scene, scale, position, background and camera framing unchanged. No text, no panels, no UI. Same 1672 by 941 landscape composition. This is an equipped weapon variant of the same game interface scene, not a new illustration.

### knight-poleaxe.png
References: knight-scene.png, poleaxe.png

Use case: precise-object-edit. Image1 is edit target, Image2 is the replacement weapon. Replace ONLY the weapon held by the character in image1 with the poleaxe shown in image2, scaled correctly and held at the same grip with realistic alignment. Preserve character identity, exact pose, armor, scene, scale, position, background and camera framing unchanged. No text, no panels, no UI. Same 1672 by 941 landscape composition. This is an equipped weapon variant of the same game interface scene, not a new illustration.

### class-poleaxe.png
References: class-scene.png, poleaxe.png

Use case: precise-object-edit. Image1 is edit target, Image2 is the replacement weapon. Replace ONLY the weapon held by the character in image1 with the poleaxe shown in image2, scaled correctly and held at the same grip with realistic alignment. Preserve character identity, exact pose, armor, scene, scale, position, background and camera framing unchanged. No text, no panels, no UI. Same 1672 by 941 landscape composition. This is an equipped weapon variant of the same game interface scene, not a new illustration.
