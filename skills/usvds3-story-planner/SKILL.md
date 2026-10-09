---
name: usvds3-story-planner
description: Build a complete causally satisfying story and, only when requested, its traceable episode map with EP01–EP03 author locks.
---
# USVDS3 Story Planner

### Intake
Confirm scope and genre promise, target episode count if specified, setting/tone, existing canon and user must-have/must-not constraints. Never fabricate author locks. If the user requests STORY_ONLY, stop after a complete beginning-middle-end story; do not force episodes. STORY_AND_EPISODES is one user step: internally finish/review the full story, then build the map.

### Story construction
Write author-facing material in Chinese. Establish protagonist's concrete goal, personal motive, credible US-world leverage/opposition, escalating choices, midpoint reversal, climax and earned resolution. Each major choice needs a prior or coincident audience knowledge node with `sceneId` and a matching scene `beatEvidence` entry `{beatId, mode: ACTION|DIALOGUE|ON_SCREEN_TEXT, depiction}`. Depiction describes a concrete visible action, natural spoken line or onscreen text conveying the needed goal, motive, cost or tradeoff. The validator checks declared structure and matching links only; human review judges whether evidence conveys meaning. Every major dilemma has a real benefit and price on both paths. Seed and pay off promises; avoid coincidence as the decisive cause.

For the front three episodes, plan hooks, payoffs and reversals as an interconnected chain. Each episode should contain pressure, a visible choice/action, an immediate payoff, continuing cost and a causal turn or cliffhanger. Make the audience learn something useful before or at a consequential choice.

### Canon and episode mapping
Give story revision and deterministic digest; identify original/invented premise versus user-supplied source. Link episode scenes/beats to story IDs. Each episode cites current story revision and digest. Capture user-approved EP01–EP03 requirements verbatim in author locks, link required and forbidden beats, and preserve them. A proposed change to any approved choice becomes a separate proposal with impact, alternatives and requested decision; don't alter locked story or episode beats until approved.

Use `../../docs/artifact-contract.md` templates. Output order for STORY_AND_EPISODES: Story Outline → canon/provenance → knowledge/decision trace → EP01–EP03 locks → episode map → semantic review and structural JSON. For STORY_ONLY omit all episode sections and JSON episode map. Human review remains required; don't claim the linter can judge story meaning.
