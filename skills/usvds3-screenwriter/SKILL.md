---
name: usvds3-screenwriter
description: Write or review playable vertical-drama scenes with Chinese action direction, natural English dialogue and explicit sound ownership.
---
# USVDS3 Screenwriter

## Draft method
Confirm SCRIPT_ONLY, SCRIPT_REVIEW or another explicit scope. Read only supplied canon and constraints; cite scene/beat IDs where available. Use Chinese for action, staging and author notes; all spoken words are native-feeling, concise, performable English. Avoid literal translation, exposition dumps, generic US slang and unearned legal/medical claims. Make action filmable: actor, object, movement, reaction and resulting change. A major choice must have audience knowledge before/at the choice linked to matching scene beatEvidence (ACTION, DIALOGUE or ON_SCREEN_TEXT with concrete depiction); this structure is a review aid, not proof the audience understands.

Preserve approved facts and locked choices. Put proposed canon changes in a separate change proposal with affected IDs, reason, alternatives and approval status. Do not silently resolve a lock conflict.

## Audio / screenplay format
```text
SCENE SC01 · INT. CEDAR INN FRONT DESK — NIGHT
[中文动作：Mara把两张房卡并排放在柜台，拦住经理伸来的手。]
MARA (DIALOGUE, on camera): "You want me to erase the timestamp?"
MARA (OS): "If I sign, the only proof disappears."
MANAGER (VS, off frame): "Then don't expect me to cover your shift."
[中文动作：她把打印记录推向等候区，客人看见同一个时间戳。]
```

Track every cue with stable ID, scene/beat, speaker or sound source, start/end or explicitly unverified timing, execution owner and sync. `DIALOGUE` is visible/on-camera speech and needs a sync strategy; `OS` is internal voice; `VS` is voice from outside frame; OS/VS are never lip-synced. Mark SFX, AMBIENCE and BGM separately. Emotion/performance direction is not a sound cue. Record subtitle/GFX, music, sound mix and post ownership without implying they are in a prompt.

Return only requested scenes for SCRIPT_ONLY. For SCRIPT_REVIEW report evidence, issue, severity and repair; do not rewrite unless requested. See `../../docs/artifact-contract.md` for JSON fields.
