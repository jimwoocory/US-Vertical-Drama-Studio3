#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Stable JSON: recursively sort object keys, preserve array order, encode UTF-8.
export function storyDigest(story) {
  const canonical = (v, top = false) => Array.isArray(v) ? `[${v.map(x => canonical(x)).join(',')}]` : v && typeof v === 'object'
    ? `{${Object.keys(v).filter(k => !(top && k === 'digest')).sort().map(k => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`
    : JSON.stringify(v);
  return createHash('sha256').update(canonical(story, true), 'utf8').digest('hex');
}

export function validate(d) {
  const issues = [], add = (code, path, message) => issues.push({ code, path, message });
  const obj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  if (!obj(d)) return [{ code: 'E_JSON_SHAPE', path: '$', message: 'Expected a JSON object.' }];
  for (const [key, value] of [['artifactStatus','DRAFT_ONLY'],['productionApproval','BLOCKED'],['mediaExecuted',false]]) if (d[key] !== value) add('E_STATUS_CLAIM', `$.${key}`, `Must be ${JSON.stringify(value)}.`);
  if (d.schemaVersion !== 1) add('E_SCHEMA_VERSION', '$.schemaVersion', 'Expected schemaVersion 1.');
  if (typeof d.projectId !== 'string' || !d.projectId.trim()) add('E_PROJECT_ID', '$.projectId', 'A projectId is required.');
  const arrayAt = (v, path) => { if (!Array.isArray(v)) { add('E_ARRAY', path, 'Expected an array.'); return []; } return v; };
  const entries = (v, path) => arrayAt(v, path).map((x, i) => { if (!obj(x)) add('E_ITEM_SHAPE', `${path}[${i}]`, 'Expected an object entry.'); return obj(x) ? x : {}; });
  if (!obj(d.story)) add('E_FIELD', '$.story', 'Expected a story object.');
  const story = obj(d.story) ? d.story : {};
  const scenes = entries(story.scenes, '$.story.scenes');
  const episodes = entries(d.episodes, '$.episodes'), proposals = entries(d.proposedScenes, '$.proposedScenes');
  const decisions = d.majorDecisions === undefined ? [] : entries(d.majorDecisions, '$.majorDecisions');
  const knowledgeNodes = d.audienceKnowledgeNodes === undefined ? [] : entries(d.audienceKnowledgeNodes, '$.audienceKnowledgeNodes');
  const segments = entries(d.segments, '$.segments'), shots = entries(d.shots, '$.shots'), cues = entries(d.cues, '$.cues'), assets = entries(d.assets, '$.assets');
  if (typeof story.revision !== 'string' || !story.revision) add('E_STORY_REVISION', '$.story.revision', 'A story revision is required.');
  if (typeof story.digest !== 'string' || !/^[a-f0-9]{64}$/.test(story.digest)) add('E_STORY_DIGEST', '$.story.digest', 'Expected a lowercase 64-character SHA-256 digest.');
  else { try { if (storyDigest(story) !== story.digest) add('E_STORY_DIGEST_MISMATCH', '$.story.digest', 'Digest does not match canonical story content.'); } catch { add('E_STORY_DIGEST_MISMATCH', '$.story.digest', 'Story cannot be canonically serialized.'); } }
  const scopes = ['IDEA','ADAPT_SOURCE','STORY_ONLY','STORY_AND_EPISODES','SCRIPT_REVIEW','SCRIPT_ONLY','DIRECTOR_HANDOFF','PROMPT_ONLY'];
  if (!scopes.includes(d.scope)) add('E_SCOPE', '$.scope', 'Unknown request scope.');
  if (['IDEA','STORY_ONLY'].includes(d.scope) && (episodes.length || proposals.length || segments.length || shots.length || cues.length || assets.length)) add('E_SCOPE_CONTENT', '$', `${d.scope} cannot contain populated downstream sections.`);
  if (d.scope === 'STORY_AND_EPISODES' && (segments.length || shots.length || cues.length)) add('E_SCOPE_CONTENT', '$', 'STORY_AND_EPISODES cannot contain director segments, shots or cues.');
  if (d.scope === 'STORY_AND_EPISODES' && !episodes.length) add('E_EPISODES_REQUIRED', '$.episodes', 'STORY_AND_EPISODES requires episodes that cite the story.');
  if (d.scope === 'ADAPT_SOURCE') {
    const src = d.source;
    if (!obj(src) || ['id','work','rightsBasis','authorizedScope','provenance'].some(k => typeof src[k] !== 'string' || !src[k].trim())) add('E_SOURCE_PROVENANCE', '$.source', 'ADAPT_SOURCE requires non-empty id, work, supplied rights basis, authorized scope and provenance.');
  }
  const source = obj(d.source) ? d.source : {};
  const sceneMap = new Map(scenes.filter(s => typeof s.id === 'string').map(s => [s.id, s]));
  const beatSet = new Set();
  scenes.forEach((s,i) => { if (!Array.isArray(s.beats)) add('E_ARRAY', `$.story.scenes[${i}].beats`, 'Expected an array.'); else s.beats.forEach((b,j) => { if (typeof b !== 'string') add('E_FIELD', `$.story.scenes[${i}].beats[${j}]`, 'Beat ID must be a string.'); else beatSet.add(b); }); });
  const evidenceByScene = new Map();
  scenes.forEach((s,i) => {
    const path=`$.story.scenes[${i}].beatEvidence`;
    if (s.beatEvidence !== undefined && !Array.isArray(s.beatEvidence)) { add('E_KNOWLEDGE_UNDEPICTED',path,'Expected an array of concrete beat evidence.'); return; }
    const rows=Array.isArray(s.beatEvidence)?s.beatEvidence:[];
    evidenceByScene.set(s.id,rows);
    rows.forEach((e,j)=>{
      const ep=`${path}[${j}]`;
      if(!obj(e)||typeof e.beatId!=='string'||!Array.isArray(s.beats)||!s.beats.includes(e.beatId)||!['ACTION','DIALOGUE','ON_SCREEN_TEXT'].includes(e.mode)||typeof e.depiction!=='string'||!e.depiction.trim()) add('E_KNOWLEDGE_UNDEPICTED',ep,'Evidence must match a scene beat and include a valid mode plus non-empty concrete depiction.');
    });
  });
  const refs = (item, path, key, allowed, code) => { if (!Array.isArray(item[key])) { add('E_ARRAY', `${path}.${key}`, 'Expected an array.'); return []; } item[key].forEach((x,i) => { if (typeof x !== 'string') add('E_FIELD', `${path}.${key}[${i}]`, 'Reference must be a string.'); else if (!allowed.has(x)) add(code, `${path}.${key}`, `Unknown reference: ${x}.`); }); return item[key].filter(x => typeof x === 'string'); };
  const locks = d.authorLocks === undefined ? [] : entries(d.authorLocks, '$.authorLocks'), lockMap = new Map();
  locks.forEach((l,i) => {
    const p = `$.authorLocks[${i}]`;
    if (typeof l.id !== 'string' || !l.id.trim()) add('E_FIELD', `${p}.id`, 'Lock ID is required.'); else if (lockMap.has(l.id)) add('E_DUPLICATE_ID', `${p}.id`, `Duplicate ID ${l.id}.`); else lockMap.set(l.id,l);
    if (!/^EP0[1-3]$/.test(l.episodeId ?? '')) add('E_FIELD', `${p}.episodeId`, 'Lock target must be EP01, EP02 or EP03.');
    if (!['USER','AUTHOR'].includes(l.origin)) add('E_FIELD', `${p}.origin`, 'Lock origin must be USER or AUTHOR.');
    if (!Array.isArray(l.requiredBeatIds) || !l.requiredBeatIds.length) add('E_ARRAY', `${p}.requiredBeatIds`, 'At least one required beat ID is required.');
    else l.requiredBeatIds.forEach((b,j) => { if (typeof b !== 'string' || !beatSet.has(b)) add('E_BEAT_REF', `${p}.requiredBeatIds[${j}]`, `Unknown required beat: ${b}.`); });
    if (l.mustNotBeatIds !== undefined && !Array.isArray(l.mustNotBeatIds)) add('E_ARRAY', `${p}.mustNotBeatIds`, 'Expected an array.');
    else for (const b of l.mustNotBeatIds ?? []) if (typeof b !== 'string' || !beatSet.has(b)) add('E_BEAT_REF', `${p}.mustNotBeatIds`, `Unknown forbidden beat: ${b}.`);
    if (Array.isArray(l.requiredBeatIds) && Array.isArray(l.mustNotBeatIds)) for (const b of l.requiredBeatIds) if (l.mustNotBeatIds.includes(b)) add('E_AUTHOR_LOCK_CONTRADICTION', p, `Beat ${b} is both required and forbidden by lock ${l.id}.`);
  });
  episodes.forEach((e,i) => {
    const p = `$.episodes[${i}]`;
    if (e.storyRevision !== story.revision || e.storyDigest !== story.digest) add('E_STALE_STORY', p, 'Episode cites a stale story revision or digest.');
    const episodeBeats = refs(e,p,'beatRefs',beatSet,'E_BEAT_REF'); refs(e,p,'sceneRefs',new Set(sceneMap.keys()),'E_SCENE_REF');
    const lockIds = refs(e,p,'authorLockRefs',new Set(lockMap.keys()),'E_AUTHOR_LOCK_REF');
    for (const l of locks.filter(x => x.episodeId === e.id)) {
      if (!lockIds.includes(l.id)) add('E_AUTHOR_LOCK_REF', `${p}.authorLockRefs`, `Episode must reference lock ${l.id}.`);
      for (const b of l.requiredBeatIds ?? []) if (!episodeBeats.includes(b)) add('E_AUTHOR_LOCK_BEAT', `${p}.beatRefs`, `Required beat ${b} for ${l.id} is missing.`);
      for (const b of l.mustNotBeatIds ?? []) if (episodeBeats.includes(b)) add('E_AUTHOR_LOCK_FORBIDDEN_BEAT', `${p}.beatRefs`, `Forbidden beat ${b} for ${l.id} is present.`);
    }
    for (const id of lockIds) { const l=lockMap.get(id); if (l && l.episodeId !== e.id) add('E_AUTHOR_LOCK_EPISODE', `${p}.authorLockRefs`, `Lock ${id} targets ${l.episodeId}.`); }
  });
  // Episode beatRefs are ordered. Every declared major decision must have a
  // complete audience-knowledge trace at or before its decision beat.
  const episodeOrder = new Map();
  episodes.forEach((e,i) => {
    if ((decisions.length || d.scope==='STORY_AND_EPISODES') && (!Number.isInteger(e.order) || e.order < 1)) add('E_EPISODE_ORDER', `$.episodes[${i}].order`, 'Episode order must be a positive integer.');
    else if (episodeOrder.has(e.order)) add('E_EPISODE_ORDER', `$.episodes[${i}].order`, 'Episode order must be unique.');
    else episodeOrder.set(e.order, e);
  });
  const nodeMap = new Map(), decisionMap = new Map();
  decisions.forEach((dec,i)=>{ if(typeof dec.id==='string'&&dec.id.trim()) { if(decisionMap.has(dec.id)) add('E_DUPLICATE_ID',`$.majorDecisions[${i}].id`,`Duplicate decision ${dec.id}.`); else decisionMap.set(dec.id,dec); } });
  knowledgeNodes.forEach((n,i) => {
    const p=`$.audienceKnowledgeNodes[${i}]`;
    if (typeof n.id !== 'string' || !n.id.trim()) add('E_KNOWLEDGE_TRACE', `${p}.id`, 'Knowledge node needs a stable ID.');
    else if(nodeMap.has(n.id)) add('E_DUPLICATE_ID', `${p}.id`, `Duplicate knowledge node ${n.id}.`); else nodeMap.set(n.id,n);
    const required=['episodeId','beatId','sceneId','decisionId','actor','goal','motive','cost','choice','chosenTradeoff','rejectedTradeoff'];
    if(required.some(k=>typeof n[k]!=='string'||!n[k].trim())) add('E_KNOWLEDGE_TRACE',p,'Knowledge trace needs episode, beat, decision, actor, goal, motive, cost, choice, and both tradeoffs.');
    const ep=episodes.find(e=>e.id===n.episodeId);
    if(!ep || !Array.isArray(ep.beatRefs) || !ep.beatRefs.includes(n.beatId)) add('E_KNOWLEDGE_STALE',`${p}.beatId`,'Knowledge beat is missing from its declared episode beatRefs.');
    const scene=sceneMap.get(n.sceneId), evidence=(evidenceByScene.get(n.sceneId)||[]).find(x=>obj(x)&&x.beatId===n.beatId);
    if(!scene || !Array.isArray(scene.beats) || !scene.beats.includes(n.beatId) || !ep || !Array.isArray(ep.sceneRefs) || !ep.sceneRefs.includes(n.sceneId) || !evidence || !['ACTION','DIALOGUE','ON_SCREEN_TEXT'].includes(evidence.mode) || typeof evidence.depiction!=='string' || !evidence.depiction.trim()) add('E_KNOWLEDGE_UNDEPICTED',`${p}.beatId`,'Knowledge node must link to matching beat evidence in a story scene cited by its episode.');
    if(!decisionMap.has(n.decisionId)) add('E_KNOWLEDGE_STALE',`${p}.decisionId`,'Knowledge node points to an unknown major decision.');
  });
  decisions.forEach((dec,i) => {
    const p=`$.majorDecisions[${i}]`;
    if(typeof dec.id!=='string'||!dec.id.trim()||typeof dec.episodeId!=='string'||typeof dec.beatId!=='string') { add('E_KNOWLEDGE_TRACE',p,'Major decision needs stable id, episodeId, and beatId.'); return; }
    const ep=episodes.find(e=>e.id===dec.episodeId);
    if(!ep || !Array.isArray(ep.beatRefs) || !ep.beatRefs.includes(dec.beatId)) { add('E_KNOWLEDGE_STALE',`${p}.beatId`,'Decision beat is missing from its declared episode beatRefs.'); return; }
    const di=ep.beatRefs.indexOf(dec.beatId);
    const nodes=knowledgeNodes.filter(n=>n.decisionId===dec.id);
    if(!nodes.length) { add('E_KNOWLEDGE_ABSENT',p,'Every major decision needs an audience knowledge node.'); return; }
    for(const n of nodes) {
      const sourceEp=episodes.find(e=>e.id===n.episodeId);
      const ki=Array.isArray(sourceEp?.beatRefs) ? sourceEp.beatRefs.indexOf(n.beatId) : -1;
      if(!sourceEp || !Number.isInteger(sourceEp.order) || !Number.isInteger(ep.order) || ki<0 || sourceEp.order>ep.order || (sourceEp.order===ep.order && ki>di)) add('E_KNOWLEDGE_STALE',p,`Knowledge ${n.id} must occur in an earlier episode or before/at decision beat ${dec.beatId}.`);
      const textFields=['actor','goal','motive','cost','choice','chosenTradeoff','rejectedTradeoff'];
      if(textFields.some(k=>typeof n[k]!=='string'||!n[k].trim())) add('E_KNOWLEDGE_TRACE',p,`Knowledge ${n.id} has an incomplete actor/goal/motive/cost/choice/tradeoff trace.`);
    }
  });
  // Author constraints are optional; never manufacture locks for a user who
  // supplied none. Once supplied, each lock must point to a real episode.
  if(d.scope==='STORY_AND_EPISODES') for(const l of locks) {
    if(!episodes.some(e=>e.id===l.episodeId)) add('E_AUTHOR_LOCK_EPISODES','$.episodes',`Author lock ${l.id} targets an episode missing from the map: ${l.episodeId}.`);
  }
  const checkRefs = (item,path) => { refs(item,path,'beatRefs',beatSet,'E_BEAT_REF'); if (item.sceneRef !== undefined && !sceneMap.has(item.sceneRef)) add('E_SCENE_REF', `${path}.sceneRef`, 'Unknown scene reference.'); };
  proposals.forEach((p,i) => {
    const path=`$.proposedScenes[${i}]`; checkRefs(p,path);
    if (p.episodeId !== undefined && (typeof p.episodeId !== 'string' || !/^EP(?:0[1-9]|[1-9][0-9]+)$/.test(p.episodeId))) add('E_EPISODE_REF', `${path}.episodeId`, 'Episode target must be a valid ID such as EP01 or EP12.');
    for (const l of locks.filter(x => x.episodeId === p.episodeId)) for (const b of l.mustNotBeatIds ?? []) if (Array.isArray(p.beatRefs) && p.beatRefs.includes(b)) add('E_AUTHOR_LOCK_FORBIDDEN_BEAT', `${path}.beatRefs`, `Forbidden beat ${b} for ${l.id} is present.`);
    if (p.storyRevision !== story.revision || p.storyDigest !== story.digest) add('E_STALE_STORY', path, 'Proposed scene cites a stale story revision or digest.');
    if (p.clashesWithLocks !== undefined) {
      const clashes=refs(p,path,'clashesWithLocks',new Set(lockMap.keys()),'E_AUTHOR_LOCK_REF');
      if (clashes.length && (!obj(p.authorLockResolution) || typeof p.authorLockResolution.decisionId !== 'string' || !p.authorLockResolution.decisionId.trim() || p.authorLockResolution.decision !== 'AUTHOR_APPROVED' || p.authorLockResolution.approver !== 'AUTHOR')) add('E_AUTHOR_LOCK_CLASH', `${path}.authorLockResolution`, 'Clash needs a specific author resolution decision; this is not production approval.');
    }
    if (p.changesApprovedChoice === true && (!Array.isArray(p.clashesWithLocks) || !p.clashesWithLocks.length)) add('E_AUTHOR_LOCK_CLASH', `${path}.clashesWithLocks`, 'A declared approved-choice change must identify affected locks as a proposal.');
    if (p.adaptationLevel !== undefined && !['L0','L1','L2'].includes(p.adaptationLevel)) add('E_ADAPTATION_LEVEL', `${path}.adaptationLevel`, 'Expected L0, L1 or L2.');
    if ((p.adaptationLevel === 'L2' || p.changesCanon === true) && p.authorApproval !== true) add('E_AUTHOR_APPROVAL_REQUIRED', `${path}.authorApproval`, 'L2 adaptations and canon-changing proposals require explicit author approval only.');
  });
  const unique = (list,path) => { const seen=new Set(); list.forEach((x,i) => { if (typeof x.id !== 'string' || !x.id.trim()) add('E_ID_REQUIRED',`${path}[${i}].id`,'Stable ID required.'); else if(seen.has(x.id)) add('E_DUPLICATE_ID',`${path}[${i}].id`,`Duplicate ID ${x.id}.`); else seen.add(x.id); }); };
  unique(cues,'$.cues'); unique(shots,'$.shots'); unique(segments,'$.segments');
  const cueMap=new Map(cues.map(x=>[x.id,x])), shotMap=new Map(shots.map(x=>[x.id,x]));
  segments.forEach((s,i) => {
    const p=`$.segments[${i}]`; checkRefs(s,p);
    if (!Number.isFinite(s.durationSeconds) || s.durationSeconds <= 0) add('E_TIMING',`${p}.durationSeconds`,'Segment duration must be positive and finite.');
    if (typeof s.prompt !== 'string' || !s.prompt.trim()) add('E_PROMPT_MISSING',`${p}.prompt`,'Each generatable segment needs a prompt.');
    if (!Array.isArray(s.shotRefs) || !s.shotRefs.length) add('E_SHOT_COVERAGE',`${p}.shotRefs`,'Each segment needs at least one shot.');
    else s.shotRefs.forEach(id=>{ if(typeof id!=='string'||!shotMap.has(id)||shotMap.get(id).segmentRef!==s.id) add('E_SHOT_REF',`${p}.shotRefs`,`Missing or mismatched shot ${id}.`); });
    if (!Array.isArray(s.cueRefs)) {
      add('E_ARRAY',`${p}.cueRefs`,'Expected an array.');
      add('E_CUE_COVERAGE',`${p}.cueRefs`,'cueRefs must be an array, including when empty.');
    } else {
      s.cueRefs.forEach(id=>{ if(typeof id!=='string'||!cueMap.has(id)||cueMap.get(id).segmentRef!==s.id) add('E_CUE_COVERAGE',`${p}.cueRefs`,`Missing or mismatched cue ${id}.`); });
      for (const c of cues.filter(x=>x.segmentRef===s.id)) if (!s.cueRefs.includes(c.id)) add('E_CUE_COVERAGE',`${p}.cueRefs`,`Cue ${c.id} is not covered by this segment.`);
    }
  });
  shots.forEach((s,i) => { const p=`$.shots[${i}]`, seg=segments.find(x=>x.id===s.segmentRef); if(!seg) add('E_SEGMENT_REF',`${p}.segmentRef`,'Shot references an unknown segment.'); if(!Number.isFinite(s.durationSeconds)||s.durationSeconds<=0) add('E_TIMING',`${p}.durationSeconds`,'Shot duration must be positive and finite.'); });
  segments.forEach((s,i)=>{ const total=shots.filter(x=>x.segmentRef===s.id).reduce((n,x)=>n+(Number.isFinite(x.durationSeconds)?x.durationSeconds:0),0); if(total>s.durationSeconds+1e-6) add('E_SHOT_SUM',`$.segments[${i}].durationSeconds`,'Shot durations exceed segment duration.'); });
  cues.forEach((c,i)=>{
    const p=`$.cues[${i}]`, seg=segments.find(x=>x.id===c.segmentRef), spoken=['DIALOGUE','OS','VS'].includes(c.type), sound=['SFX','AMBIENCE','BGM','MUSIC'].includes(c.type);
    if(!seg) add('E_SEGMENT_REF',`${p}.segmentRef`,'Cue references an unknown segment.');
    if(!['DIALOGUE','OS','VS','SFX','AMBIENCE','BGM','MUSIC'].includes(c.type)) add('E_CUE_TYPE',`${p}.type`,'Unknown audio cue type.');
    if(spoken&&!(c.speaker||c.source)) add('E_CUE_SOURCE',`${p}.speaker`,'Spoken cue needs a speaker or source.');
    if(sound&&!c.source) add('E_CUE_SOURCE',`${p}.source`,'Sound cue needs a source.');
    if(c.type==='DIALOGUE'&&(!c.lipSync||c.lipSync==='NONE')) add('E_DIALOGUE_SYNC',`${p}.lipSync`,'DIALOGUE requires an explicit sync strategy.');
    if(['OS','VS'].includes(c.type)&&c.lipSync!=='NONE') add('E_OS_VS_LIPSYNC',`${p}.lipSync`,'OS/VS cannot be lip-synced.');
    if(!Number.isFinite(c.startSeconds)||!Number.isFinite(c.endSeconds)||c.startSeconds<0||c.endSeconds<c.startSeconds||(seg&&c.endSeconds>seg.durationSeconds)) add('E_TIMING',`${p}.startSeconds`,'Cue timing must be ordered, nonnegative and within segment duration.');
  });
  if(d.scope==='ADAPT_SOURCE') scenes.forEach((s,i)=>{ if(!Array.isArray(s.sourceRefs)||!s.sourceRefs.length) add('E_SOURCE_REF',`$.story.scenes[${i}].sourceRefs`,'Adapted scenes require declared source references.'); else s.sourceRefs.forEach((r,j)=>{ if(!obj(r)||r.sourceId!==source.id||r.authorizedScope!==source.authorizedScope) add('E_SOURCE_REF',`$.story.scenes[${i}].sourceRefs[${j}]`,'Source reference must match declared source id and authorized supplied scope.'); }); });
  assets.forEach((a,i)=>{ if(a.projectId&&a.projectId!==d.projectId&&!(a.crossProjectPermission===true&&typeof a.permissionProvenance==='string'&&a.permissionProvenance.trim())) add('E_CROSS_PROJECT_ASSET',`$.assets[${i}]`,'Cross-project asset requires explicit permission and reviewable provenance.'); });
  return issues;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const file=process.argv[2]; if(!file){console.error('Usage: node tools/checkup.mjs <artifact.json>');process.exit(2);}
  try { const data=JSON.parse(await readFile(file,'utf8')), issues=validate(data); if(issues.length){for(const i of issues)console.error(`${i.code} ${i.path}: ${i.message}`);process.exitCode=1;} else console.log(`PASS ${file}: structural contract valid; DRAFT_ONLY, production BLOCKED, media not executed.`); }
  catch(e){console.error(`E_JSON $: ${e.message}`);process.exitCode=1;}
}
