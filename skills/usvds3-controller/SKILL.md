---
name: usvds3-controller
description: Route a USVDS3 Lite request to exactly the requested draft deliverable without forcing later workflow stages.
---
# USVDS3 Controller

Classify the request as exactly one primary scope: `IDEA`, `ADAPT_SOURCE`, `STORY_ONLY`, `STORY_AND_EPISODES`, `SCRIPT_REVIEW`, `SCRIPT_ONLY`, `DIRECTOR_HANDOFF`, or `PROMPT_ONLY`. Ask a narrow question only if a missing input blocks that scope. Do not silently expand the request.

Return only the requested artifact. Story-only ends after the full story outline; never add an episode map. Story plus episodes internally plans and reviews story first, then episodes. Script-only does not create story canon. Director handoff does not generate media. Mark deliverables draft-only; never imply plugin installation, production approval, or executed generation.

Use the relevant adjacent skills for method. For provenance, canon changes, and approval limits, see `../../docs/artifact-contract.md`.
