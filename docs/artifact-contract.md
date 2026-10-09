# Draft artifact contract v1

All files are offline writing artifacts. Every project keeps `artifactStatus: DRAFT_ONLY`, `productionApproval: BLOCKED`, and `mediaExecuted: false`. Author approval of a story proposal is not production approval (ND-001).

## Authoring templates

### Story Outline (Chinese)
`Project / scope / revision / provenance`; logline and audience promise; setting and plausible local power mechanism; protagonist goal, motive and vulnerability; opposition with credible goal; beginning (inciting pressure and first choice), middle (escalation, reversal and cost), end (climax choice, payoff and consequence); canon facts; unresolved research questions. Story-only ends here and has no episode map.

### STORY_AND_EPISODES (one user step)
1. Complete/review the whole story first; then provide `Canon revision + SHA-256 digest`, provenance and change history.
2. List every major decision in causal order. Give a stable `decisionId`, episode/beat, actor, goal, motive, cost, chosen/rejected tradeoffs, and at least one `AUDIENCE_KNOWLEDGE` beat before or at the decision. It must show what the audience knows at that point. Never defer the explanation until after the choice.
3. Preserve EP01–EP03 author constraints only when supplied; otherwise do not invent them. Record stable IDs, origin, exact required/forbidden beats and decision status. Map each into its episode. A conflicting idea stays a proposal until the author explicitly approves the change; retain the previous approved version and list downstream work needing rebuild.
4. Provide 6–8 episodes unless the author requests another count. Each entry: order, episode ID, logline, beat/scene references, visible choice/action, immediate payoff, continuing cost, hook/payoff/reversal, cliffhanger, lock references and current story revision/digest. Front three episodes collectively expose and pay off multiple hooks/reversals; avoid three empty teasers.
5. Add human semantic review and JSON for the offline structural validator.

### Director handoff (only when requested)
`SCENE → SEGMENT → SHOT → CUE` stable IDs; scene/beat mapping; relative seconds; visible action, framing and continuity anchors; one English visual prompt per segment; performed English dialogue; separately labeled OS/VS/SFX/AMBIENCE/BGM; subtitles/GFX/audio/edit ownership. Example: `00:00–00:03 SHOT01 wide locked-off: rain runs down the same brass key cabinet at frame left; Mara's right hand pins the log. 00:03–00:06 SHOT02 insert: timestamp 9:14 PM remains readable; her left hand slides the log toward guests. Match screen direction and damp sleeve.` Any changed choice/reveal/outcome becomes an author proposal.

## JSON schema notes

`schemaVersion: 1`; `story.scenes[].beats` is an ordered catalog of stable beat IDs. `episodes[]` carries `id`, positive unique `order` for story-plus-episodes, `storyRevision`, `storyDigest`, ordered `beatRefs`, `sceneRefs` and `authorLockRefs`. Author locks for EP01–EP03 are optional when the author provides no constraints; never fabricate them. Every supplied lock must target an existing episode and must be referenced by that episode. Locks use `requiredBeatIds` and optional `mustNotBeatIds`; an example lock may use `provenance` to make its explicitly fictional illustrative origin clear.

`majorDecisions[]` declares each major choice with `id`, `episodeId`, and `beatId`. Every audience knowledge node also declares `sceneId`; its `story.scenes[]` scene must contain matching `beatEvidence[]` with `{beatId, mode, depiction}`, where `mode` is `ACTION`, `DIALOGUE`, or `ON_SCREEN_TEXT` and `depiction` describes a concrete visible action, natural spoken line, or onscreen text conveying the needed goal, motive, cost or tradeoff. The node's beat must match this evidence and occur in its episode's ordered `beatRefs` in an earlier episode, or before/at the decision beat in the same episode. `E_KNOWLEDGE_UNDEPICTED` catches absent/malformed/mismatched declared evidence; it does not understand semantics or establish that the audience will understand. Include nodes for every major decision; no NLP classifier is claimed.

Story digest is lowercase SHA-256 over UTF-8 stable JSON: recursively sort object keys, preserve array order, and exclude only the story object's top-level `digest`. It detects content drift relative to that digest, not authorship, origin or rights.

For adaptation, record `source.id`, `work`, user-stated `rightsBasis`, `authorizedScope` and `provenance`; each adapted scene cites matching `sourceRefs`. L0 transfers directly, L1 is minimal functional equivalence, L2 requires explicit author approval. Any `changesCanon: true` also requires `authorApproval: true`. These are declarations, not rights verification.

Segments/shots have positive finite durations, shot totals within segment. Audio cue times fit a segment. Cue types: DIALOGUE, OS, VS, SFX, AMBIENCE, BGM (MUSIC alias). Dialogue requires explicit sync; OS/VS use `lipSync: NONE`. Each segment references its shots and cues.

`IDEA` and `STORY_ONLY` cannot have populated downstream sections. `STORY_ONLY` has no episodes. `STORY_AND_EPISODES` requires episodes but no director segments/shots/cues. `DIRECTOR_HANDOFF` is the complete production-text handoff shape. All remain draft-only.

## Limits

`tools/checkup.mjs` checks JSON structure, declared references, digest, required fields, episode beat order, author-lock mappings, declared knowledge-before-decision order, matching beatEvidence structure and cue timing, plus fixed draft status. It cannot interpret evidence semantics, infer omitted major decisions, assess audience comprehension, verify US social/legal plausibility, rights, natural English, performance, creative quality, or prove media execution. Human semantic review is mandatory.

The Cedar Inn JSON uses explicitly fictional sample constraints marked with provenance; these are illustrative user requirements created for the example, not claims about a real author's intent.

When a proposal explicitly sets `changesApprovedChoice: true`, it must identify affected lock IDs in `clashesWithLocks` and include an author resolution record. This catches declared changes; the checker cannot infer a semantic change that was not declared.
