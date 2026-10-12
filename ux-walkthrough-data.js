// Shared content for the browser presentation and its editable PowerPoint export.
window.uxWalkthrough = [
  {
    id:'intro', section:'Introduction', title:'The thinking behind the interface',
    subtitle:'Remi Couture · UX design walkthrough',
    body:'A guided conversation about the decisions, flows, and trade-offs behind my work.',
    notes:'Suggested opening: I will walk through how I connect screens into an experience, make decisions readable, and communicate the design before it is fully polished. Ask which part is most relevant to the person in the room. The full route takes roughly 15–20 minutes. The short route keeps the core examples and educational comparison.',
    source:'Existing résumé, portfolio, and UX walkthroughs', type:'cover'
  },
  {
    id:'approach', section:'Framing', title:'A decision before a screen',
    body:'I frame the task, map the journey, make the choice readable, and check how the experience responds.',
    points:['What is the person trying to accomplish?','What must they understand before choosing?','What happens after the action, on cancel, or when something fails?','What evidence would change the design?'],
    notes:'Use this as the lens for the examples, rather than claiming every project followed an identical process. Ask the audience to keep one question in mind: can the person predict what their next action will do? Distinguish what the original artifacts show from your retrospective interpretation.',
    source:'portfolio-ux-data.js and services.html#process', type:'text'
  },
  {
    id:'brief', section:'Framing', title:'The brief and the constraints', type:'gap',
    subtitle:'Project-specific evidence to add',
    slots:['Original problem statement','My responsibility and collaborators','Platform, audience, and production constraints'],
    suggestions:['Add a real brief or a short account of the request in your own words.','Name the decisions you owned and the work your teammates contributed.','Add confirmed constraints such as controller input, localisation, timeline, or engine requirements.'],
    notes:'This page intentionally leaves the project details blank. Fill it for the project you plan to discuss. Avoid inventing personas or research to make the story appear complete. If the brief is unavailable, explain the task visible in the artifact and state that the original brief is not available.',
    source:'No original project brief supplied'
  },
  {
    id:'stardust-flow', section:'Connected journeys', title:'Stardust Canvas: the complete loop', type:'image',
    image:'portfolio-imgs/stardust-flowchart.png', alt:'Original Stardust Canvas flowchart connecting discovery, gameplay, painting, rewards, and sharing',
    body:'The flow connects discovery and play to earning stars, painting, personalisation, and sharing.',
    points:['Play connects to a creative goal.','Win and loss branches both have a next step.'],
    link:['Open the original walkthrough','portfolio-showcase.html#stardust/flow'],
    notes:'Context: original design period 2020–2021, UX Magicians. Start at discovery and follow the activity loop. Explain where the reward enables the next creative step. The win and loss branches are visible in the source. Draft recovery and a private-save path are later proposals in the portfolio, not documented original behaviour. Ask: where could a person lose track of what they have earned?',
    source:'portfolio-data.js, portfolio-ux-data.js; portfolio-imgs/stardust-flowchart.png'
  },
  {
    id:'stardust-return', section:'Connected journeys', title:'The way back belongs in the design', type:'image',
    image:'portfolio-imgs/s-image121.png', alt:'Original Stardust Canvas sitemap with destinations and return paths',
    body:'The sitemap places individual activities within a larger product. A completed activity needs a clear destination afterwards.',
    points:['Destinations and the activity loop share a navigation structure.','Interruption and cancelled sharing need a deliberate return path.'],
    notes:'The source sitemap supplies the structure. Use it to explain navigation context and return routes. Proposed extension: keep a draft and let someone finish without sharing publicly. Do not claim that this recovery behaviour shipped or improved retention. Suggested task: finish a painting, cancel sharing, and find it again.',
    source:'portfolio-imgs/s-image121.png; portfolio-ux-data.js: stardust'
  },
  {
    id:'mw5-context', section:'Complex decisions', title:'MechWarrior 5: context beside the decision', type:'image',
    image:'portfolio-imgs/mw5-mission.png', alt:'MechWarrior 5 mission briefing showing mission information and squad preparation',
    body:'Mission conditions and the available lance share the screen so the player can review the contract alongside their resources.',
    points:['What does the mission require?','What can the player bring into it?'],
    link:['Explore the mission flow','portfolio-showcase.html#mechwarrior/flow'],
    notes:'Original work from the Piranha Games studio period, 2016–2018. Your documented role is UX/UI. Explain the connection between destination, contract, and preparation. Talk about the information that supports the decision without claiming sole ownership of the game or undocumented usability results.',
    source:'portfolio-data.js: mechwarrior; portfolio-imgs/mw5-mission.png'
  },
  {
    id:'mw5-recovery', section:'Complex decisions', title:'Repair cost and a recoverable commitment', type:'image',
    image:'portfolio-imgs/mw5-mechbay.png', alt:'Original MechWarrior 5 mech bay with component labels and maintenance information',
    body:'The original mech bay connects component information to the machine. The portfolio prototype extends it with explicit cost review and cancellation.',
    points:['Original artifact: component labels, repair status, cost, and time.','New proposal: review, confirm, and return with the contract selection retained.'],
    link:['Open the repair prototype','portfolio-showcase.html#mechwarrior/prototype'],
    notes:'Show the original mech bay first. Then explicitly introduce the later concept extension. Demo a standard repair, cancel before spending, and the insufficient-funds scenario. The credit values and essential-repair rule are illustrative prototype content. Suggested validation: can a player explain the cost before confirming and identify what blocks deployment?',
    source:'portfolio-imgs/mw5-mechbay.png; portfolio-ux-data.js: mechwarrior'
  },
  {
    id:'vanguard-start', section:'A concept revisited', title:'Vanguard: the starting point', type:'image',
    image:'portfolio-imgs/vanguard/original.png', alt:'Supplied older Vanguard class-selection concept',
    body:'The concept communicates a strong world. Repeated numerical ratings and unnamed equipment make the actual choice harder to interpret.',
    points:['What does a rating of 9 mean?','Which item is equipped, and what will Fight do?'],
    notes:'This is a visual critique, not a user-test finding. The original date and game affiliation are unconfirmed. Vanguard is the portfolio study title. Describe what can be observed in the image, then explain what you chose to clarify. The following screens are 2026 AI-assisted companion concepts with an interactive React prototype.',
    source:'portfolio-imgs/vanguard/original.png; portfolio-data.js: vanguard'
  },
  {
    id:'vanguard-role', section:'A concept revisited', title:'The role needs a readable trade-off', type:'image',
    image:'portfolio-imgs/vanguard/class-selection.png', alt:'Vanguard companion concept showing a class role, relative traits, and named equipped items',
    body:'The revised concept pairs a role description with relative traits and named equipment before asking the player to review the loadout.',
    points:['Reach, mobility, and protection explain the proposed role.','Equipped labels make the current state explicit.'],
    notes:'2026 concept proposal. Traits are illustrative design content, not official balance rules. Explain the intended information hierarchy. There is a useful unresolved tension: heavy plate artwork can imply high protection. Validate that interpretation or change the silhouette. This is a design question, not a proven improvement.',
    source:'portfolio-imgs/vanguard/class-selection.png; portfolio-ux-data.js: vanguard'
  },
  {
    id:'vanguard-loadout', section:'A concept revisited', title:'Preview and equip are different actions', type:'image',
    image:'portfolio-imgs/vanguard/loadout.png', alt:'Vanguard loadout concept distinguishing equipped, previewed, and locked weapons',
    body:'Equipped, Preview, and Locked describe distinct states. Comparing a weapon should leave the current loadout intact until the player applies the change.',
    points:['Cancel keeps the halberd.','Equip commits the poleaxe.','A locked item explains the example rank requirement.'],
    notes:'2026 AI-assisted companion screen. Use the live prototype to demonstrate preview versus commitment. Explain how focus should return to the selected item after cancellation, and how the interface should announce successful equipment changes. The unlock requirements are example rules.',
    source:'portfolio-imgs/vanguard/loadout.png; src/vanguard-state.js; portfolio-ux-data.js: vanguard'
  },
  {
    id:'vanguard-deploy', section:'A concept revisited', title:'Review, deploy, and recover', type:'image',
    image:'portfolio-imgs/vanguard/deployment.png', alt:'Vanguard deployment review showing class, team, equipment, and match context',
    body:'The review brings the selection together. Deploy begins joining, while a failed join keeps the player’s choices available for retry.',
    points:['A completed path confirms the loadout and the joining state.','Cancel and failed joins preserve deliberate choices.'],
    link:['Run the live Vanguard concept','vanguard.html'],
    notes:'Suggested live demo: choose a class, preview the poleaxe, cancel, then equip it and review. Deploy, simulate a failed join using the prototype controls, and show that selections remain intact. These are implemented concept behaviours, not production-game outcomes. Open the demo in a separate tab so the presentation keeps its place.',
    source:'portfolio-imgs/vanguard/deployment.png; src/vanguard.jsx; src/vanguard-state.js'
  },
  {
    id:'validation', section:'Validation', title:'What I would test next', type:'validation',
    body:'Proposed Vanguard usability session with 5–6 players of mixed genre familiarity. These are future checks, not completed findings.',
    points:['Explain the class trade-off without prompting.','Preview and cancel a swap, then identify the equipped weapon.','Inspect a locked item and recover from a failed join.','Repeat core tasks with keyboard input and check focus and reading order.'],
    slots:['Observed findings','Design changes after testing'],
    suggestions:['Add task observations, participant context, and the actual test date.','Add a before-and-after decision tied to a specific observed problem.'],
    notes:'Keep findings blank until the sessions happen. Record wrong-state interpretations, accidental commitments, and task completion without prompting. Check text contrast and readability at living-room distance. A proposed sample size is a plan, not evidence. Do not turn prototype correctness tests into claims about usability.',
    source:'portfolio-ux-data.js: vanguard.measure'
  },
  {
    id:'greybox', section:'Educational interlude', title:'Greyboxing and art direction', type:'comparison',
    body:'The same foundational layout can communicate very different things. The greybox exposes the structure. The visual target makes the intended mood easier to imagine.',
    image:'ux-walkthrough-assets/lobby-greybox.png', alt:'User-supplied greybox lobby layout',
    compareImage:'ux-walkthrough-assets/lobby-art-direction.png', compareAlt:'User-supplied lobby with polished visual direction',
    points:['Shared foundation: party at the centre, social controls below, store and progression at the sides.','Visual appeal and interaction quality need separate evaluation.'],
    notes:'Your educational story: One of the hardest parts of UI/UX is helping stakeholders see the vision before polish. Focus on the structure and the work can look unfinished. Focus on the art and the underlying decisions can disappear. Greyboxing gives us room to solve hierarchy, interactions, and flows before investing heavily in visual production. But not everyone can picture the result from a wireframe. Sometimes a rough layout supports the conversation. Sometimes a visual target helps much earlier. Ask the audience what each image makes them notice first. These images share the broad layout, but visible labels, navigation, content, and emphasis differ. A screenshot pair does not establish identical behaviour or tested usability. Describe the art version as a visual target, not evidence of a validated production interface. Date, production status, and asset authorship for the supplied pair are unconfirmed.',
    source:'Two images supplied by Remi for this presentation'
  },
  {
    id:'review', section:'Educational interlude', title:'The representation changes the review', type:'text',
    body:'Before showing a design, explain which decision the audience is helping you make.',
    points:['Greybox review: can someone find the next action and understand the hierarchy?','Visual-target review: does the mood support the intended world, audience, and brand?','Interactive review: can someone predict feedback, cancel safely, and recover?','A visual target can help communicate the vision while structural questions remain open.'],
    notes:'Expand on the balancing act in your own words. Neither a stakeholder who needs polish nor one who needs the logic is necessarily wrong. They may be evaluating different things. State what is ready for review and what remains provisional. Useful invitation: let us evaluate the party-readiness hierarchy first, then discuss the visual treatment. Close the interlude by asking how the team prefers to evaluate early work.',
    source:'Remi’s supplied educational text, edited for a live presentation'
  },
  {
    id:'working-files', section:'Iteration and delivery', title:'The working files make the decisions traceable', type:'image',
    image:'services-assets/media/services/figma/deep/tnt-wire-flow.webp', alt:'TNT card-battler wireframe flow from the existing Figma working-file archive',
    body:'Wireframe flows expose relationships between screens. The existing archive includes multiple prototype rounds for the TNT card battler.',
    points:['A branch makes screen-to-screen decisions visible.','A revision needs the feedback or constraint that motivated it.'],
    link:['Explore the working-file archive','services.html#figma-deep'],
    suggestions:['Add a dated version pair and the actual feedback that caused a change.'],
    notes:'Use this archive as evidence that the files exist and show the flow structure. Multiple versions do not, on their own, explain why a change happened. Leave the rationale open if you do not have the original feedback. Bring one specific example of an alternative you considered and the constraint that led to the decision.',
    source:'services.html#figma-deep; services-assets/media/services/figma/deep/tnt-wire-flow.webp'
  },
  {
    id:'implementation', section:'Iteration and delivery', title:'The behaviour has to survive implementation', type:'image',
    image:'services-assets/media/services/focusrail-editor.png', alt:'Unreal Engine designer showing the Focusrail Focus Doctor validation panel',
    body:'Focusrail makes controller-navigation problems visible in the editor. The implementation needs to preserve the interaction intent as the interface grows.',
    points:['Focus order and focus recovery belong in the design discussion.','Verify labels, input states, and error feedback in the running build.'],
    link:['See implementation examples','services.html#implementation'],
    notes:'Focusrail is your own Unreal Engine plugin, available on Fab according to the existing portfolio. Use this capture to explain how navigation decisions become things a team can inspect and fix. Keep the claim specific to what the capture and product show. Do not claim improved production metrics without data.',
    source:'services.html; services-assets/media/services/focusrail-editor.png'
  },
  {
    id:'outcomes', section:'Evidence to complete', title:'Outcomes and lessons', type:'gap',
    subtitle:'Room for documented results',
    slots:['What changed after review or testing','Outcome and supporting evidence','What I would do differently'],
    suggestions:['Add an actual observed problem and the change it prompted.','Add a verified task result, playtest observation, or stakeholder decision with context.','Add a concrete lesson about a trade-off, limitation, or unresolved question.'],
    notes:'Intentionally blank. This is the place for evidence, not a manufactured success story. If metrics are unavailable, use a documented qualitative observation and explain its limits. Keep testimonial praise separate from measured usability. You can skip this page in a live meeting until you have evidence to discuss.',
    source:'No measured UX outcomes or original test findings supplied'
  },
  {
    id:'conversation', section:'Discussion', title:'A conversation about your interface', type:'text',
    body:'The work I want to understand is the task, the decisions around it, and the moments where people lose confidence.',
    points:['Which flow is hardest for your users to complete?','Which decision does your team need to validate next?','What could we put in front of people before investing in the full visual production?'],
    link:['Return to the portfolio','portfolio.html'],
    notes:'End by connecting the examples to the person in the room. Choose a relevant project to explore further instead of reciting every credit. For an interview, invite questions about your ownership, collaboration, and trade-offs. For a client conversation, ask for a real flow or build that would support the next discussion.',
    source:'Conversation prompts based on the supplied portfolio and educational text'
  }
];
