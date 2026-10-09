---
name: usvds3-review
description: Independently review draft provenance, story consistency, US-facing logic, dialogue, cue coverage, timing, and rollback needs without granting production approval.
---
# USVDS3 Review

Review source rights/scope declarations, provenance, story and episode trace, EP01–EP03 author locks, canon changes, dialogue intent/playability, cue coverage, visible action/result, shot timing, and cross-project asset permission. Report evidence, issue, severity and repair owner. If the draft conflicts with an author lock or stale story revision, stop downstream handoff and return to the owner.

Separate machine-checkable structure from human semantic review. The bundled checker cannot establish rights, cultural plausibility, natural English, actual lip-sync, or media quality. No review can set production status to approved: every artifact is `DRAFT_ONLY`, production approval remains `BLOCKED` (ND-001). Preserve prior draft and identify affected downstream artifacts for rollback/rebuild after approved canon changes.
