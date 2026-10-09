---
name: usvds3-controller
description: Run exactly the requested USVDS3 Lite writing workflow and return a reviewable draft in its declared scope.
---
# USVDS3 Controller

## Intake and boundaries
Classify one primary scope: IDEA, ADAPT_SOURCE, STORY_ONLY, STORY_AND_EPISODES, SCRIPT_REVIEW, SCRIPT_ONLY, DIRECTOR_HANDOFF, or PROMPT_ONLY. Preserve the user's language, supplied canon and must/must-not choices. Ask only for a genuinely blocking fact. Never expand STORY_ONLY into episodes; STORY_AND_EPISODES is one user step that completes the story before mapping episodes. Do not turn this writing plugin into an app, media provider, research claim, or production workflow.

## Shared craft rules
Use Chinese for author-facing outline, analysis and stage/action direction; write spoken dialogue in natural, performable English suited to the character and moment. Mark on-camera dialogue, OS (the visible character's internal voice), and VS (a voice originating off frame) separately. Every audience knowledge node needs a `sceneId` and matching scene `beatEvidence` `{beatId, mode: ACTION|DIALOGUE|ON_SCREEN_TEXT, depiction}` giving concrete visible action, natural spoken line or onscreen text. The validator checks links and required structure, never semantic comprehension. Show hooks, reversals and payoffs across the first three episodes; don't postpone their explanation until after a choice. Keep US institutions, jobs, money, family and legal mechanisms plausible; flag uncertain facts instead of inventing authority.

## Workflow
1. Read the relevant existing canon and user constraints. Record scope, provenance and current revision/digest when applicable.
2. Draft only the requested deliverable using the linked template in `../../docs/artifact-contract.md` and the relevant specialist skill.
3. Keep proposed canon changes separate. L0 transfers directly; L1 preserves promise and causal choice with a minimal functional equivalent; L2 and any canon change require an explicit author decision. Never silently overwrite an approved choice.
4. Return the artifact plus concise open questions/semantic risks. Mark `DRAFT_ONLY`; production stays `BLOCKED` (ND-001). Machine checks establish only declared structure, not semantic quality.

## Scope-specific output
- IDEA: premise, protagonist pressure, US setting mechanism, 2–3 story directions and their hook; no episodes.
- STORY_ONLY: complete beginning/middle/end story outline; no episode map.
- STORY_AND_EPISODES: in one response create full story first, then 6–8 episode map unless user sets another length; include canon revision/digest, provenance, decisions and any author-supplied EP01–EP03 locks (do not invent locks when none were supplied). The first three episodes must establish major hooks, payoffs and reversals, not merely tease them.
- ADAPT_SOURCE: provenance and authorized scope, scene map, L0/L1 treatment, separate L2 proposals and trace to source.
- SCRIPT_ONLY: scenes only; don't invent a story bible or episode plan.
- SCRIPT_REVIEW: evidence-led findings and repair suggestions; don't rewrite unless asked.
- DIRECTOR_HANDOFF: only when requested; scene/beat mapping, timed shots and cues, continuity, handoff ownership. No rendering claim.
- PROMPT_ONLY: prompt text only.

## Templates
For STORY_ONLY use the `Story Outline` template in the artifact contract. For STORY_AND_EPISODES include `Story Outline`, `Canon & Provenance`, `Audience Knowledge / Major Decisions`, `Author Locks EP01–EP03`, `Episode Map`, `Review Notes`, and a JSON contract artifact. Do not add unrequested downstream documents.
