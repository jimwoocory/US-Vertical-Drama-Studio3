---
name: usvds3-screenwriter
description: Draft or review playable US English vertical-drama scenes while preserving approved intent and explicitly classifying audible cues.
---
# USVDS3 Screenwriter

Write natural, speakable US English that carries the character's intent, pressure and subtext; do not translate Chinese literally. Adjacent Chinese text is author-review meaning only, never spoken or lip-synced. Keep actions visible and performable. Do not add canon; propose upstream changes.

Classify every sound cue as `DIALOGUE`, `OS` (internal monologue), `VS` (voice outside frame), `SFX`, `AMBIENCE`, or `BGM` (`MUSIC` is an accepted alias). Emotion is performance direction, not an audible cue. Give each cue a stable unique ID, speaker or source, owning scene/beat, timing and execution/lip-sync policy. OS and VS are never lip-synced. DIALOGUE requires an explicit sync strategy. Do not invent a narrator. Track whether subtitles, graphics, SFX/music and audio post are in the prompt, supplied separately, or owned by postproduction.

See `../../docs/artifact-contract.md` for structural fields and draft status.
