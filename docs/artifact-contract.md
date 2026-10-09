# Draft artifact contract

The JSON example is the offline linter's structural contract. Every artifact has `artifactStatus: DRAFT_ONLY`, `productionApproval: BLOCKED`, and `mediaExecuted: false`. An author decision never grants production approval; ND-001 approval runtime remains unavailable.

Story digest is lowercase SHA-256 over UTF-8 stable JSON: recursively sort object keys, preserve array order, and exclude only the story object's top-level `digest` property. Episode/proposal references must match the current revision and verified digest. The digest establishes integrity relative to supplied content, not authorship, origin or rights.

When `authorLocks` are supplied, each lock has a unique `id`, `episodeId` (EP01–EP03), `origin` (`USER` or `AUTHOR`), `requiredBeatIds`, and optional `mustNotBeatIds`. Matching episode entries must cite every lock ID and required beat, and may not cite a forbidden beat. A lock that marks the same beat required and forbidden is rejected. Proposed scenes with a matching `episodeId` may not cite that lock's forbidden beats. A declared proposal clash must cite an existing lock and include `authorLockResolution` with `decisionId`, `decision: AUTHOR_APPROVED`, and `approver: AUTHOR`. These checks compare declared beat IDs and episode IDs only; natural language must-haves, must-nots, or undeclared clashes cannot be semantically detected.

If `adaptationLevel` is present on a proposed scene, it must be `L0`, `L1` or `L2`. Every L2 proposal and every proposal marked `changesCanon: true` requires `authorApproval: true`, regardless of the other field. This author approval is a draft-level declaration and never changes `productionApproval` from `BLOCKED`.

`IDEA` and `STORY_ONLY` cannot contain populated downstream sections. `STORY_ONLY` stops before episodes. `STORY_AND_EPISODES` requires story-linked episodes and cannot contain segments, shots or cues. Use `DIRECTOR_HANDOFF` for a complete director payload.

ADAPT_SOURCE requires non-empty source identity, user-supplied basis, authorized scope and provenance, plus scene `sourceRefs` objects with `sourceId` and `authorizedScope` matching that declaration. This is structural traceability, not legal rights validation. Cross-project assets need explicit permission and reviewable provenance.

Segments and shots need positive finite durations; shot totals cannot exceed the segment. Audio cue times must fit their segment. Cue types are `DIALOGUE`, `OS`, `VS`, `SFX`, `AMBIENCE`, and `BGM` (`MUSIC` remains accepted as an alias). Dialogue requires an explicit sync strategy; OS/VS require `lipSync: NONE`.

Structural validation is not human semantic review. The linter cannot decide US plausibility, natural English, adaptation legality, whether a declared authorization is genuine, performance quality, or whether video exists or looks good. See the synthetic passing contract at `../examples/synthetic-project.json`.
