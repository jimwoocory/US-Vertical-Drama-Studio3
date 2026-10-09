import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validate, storyDigest } from '../tools/checkup.mjs';
const example=JSON.parse(await readFile(new URL('../examples/synthetic-project.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(example), codes=d=>validate(d).map(i=>i.code), has=(d,c)=>assert.ok(codes(d).includes(c),`expected ${c}`);

test('synthetic director handoff passes with lock, dialogue, OS, VS and SFX',()=>assert.deepEqual(validate(example),[]));
test('malformed root and nested entries return stable issues, never throw',()=>{
  assert.ok(codes(null).includes('E_JSON_SHAPE'));
  for(const [key,value] of [['episodes',[null]],['proposedScenes',[[]]],['segments',[null]],['shots',[null]],['cues',[null]],['assets',[null]],['authorLocks',[null]]]){const d=clone();d[key]=value;has(d,'E_ITEM_SHAPE');}
  const d=clone();d.story.scenes=[null];has(d,'E_ITEM_SHAPE');
  const e=clone();e.episodes[0].beatRefs=null;has(e,'E_ARRAY');
  const s=clone();s.segments[0].beatRefs={};has(s,'E_ARRAY');
  for(const malformed of [{},42]) { const x=clone();x.segments[0].cueRefs=malformed;has(x,'E_ARRAY');has(x,'E_CUE_COVERAGE'); }
});
test('story digest is recomputed and detects body or digest mutation',()=>{
  const d=clone(); assert.equal(d.story.digest,storyDigest(d.story));
  d.story.scenes[0].id='SC99';has(d,'E_STORY_DIGEST_MISMATCH');
  const x=clone();x.story.digest='b'.repeat(64);has(x,'E_STORY_DIGEST_MISMATCH');
});
test('required author locks are episode-linked and beats must be mapped',()=>{
  const d=clone();d.episodes[0].authorLockRefs=[];has(d,'E_AUTHOR_LOCK_REF');
  const x=clone();x.episodes[0].beatRefs=[];has(x,'E_AUTHOR_LOCK_BEAT');
  const y=clone();y.episodes[0].authorLockRefs=['STRAY'];has(y,'E_AUTHOR_LOCK_REF');
});
test('must-not locks reject forbidden beats in their episode and matching proposals',()=>{
  const d=clone();d.authorLocks[0].mustNotBeatIds=['B01'];has(d,'E_AUTHOR_LOCK_CONTRADICTION');
  const x=clone();x.story.scenes[0].beats.push('B02');x.story.digest=storyDigest(x.story);x.episodes[0].storyDigest=x.story.digest;x.proposedScenes[0].storyDigest=x.story.digest;x.authorLocks[0].mustNotBeatIds=['B02'];x.episodes[0].beatRefs.push('B02');has(x,'E_AUTHOR_LOCK_FORBIDDEN_BEAT');
  const y=structuredClone(x);y.episodes[0].beatRefs=['B01'];y.proposedScenes[0].beatRefs.push('B02');has(y,'E_AUTHOR_LOCK_FORBIDDEN_BEAT');
  const z=structuredClone(y);z.proposedScenes[0].episodeId='EP02';assert.ok(!codes(z).includes('E_AUTHOR_LOCK_FORBIDDEN_BEAT'));
});
test('clash needs a real lock and explicit author resolution decision',()=>{
  const d=clone();d.proposedScenes[0].clashesWithLocks=['LOCK-EP01-01'];has(d,'E_AUTHOR_LOCK_CLASH');
  d.proposedScenes[0].authorLockResolution={decisionId:'DEC-1',decision:'AUTHOR_APPROVED',approver:'AUTHOR'};assert.deepEqual(validate(d),[]);
  const x=clone();x.proposedScenes[0].clashesWithLocks=['NO-SUCH-LOCK'];has(x,'E_AUTHOR_LOCK_REF');has(x,'E_AUTHOR_LOCK_CLASH');
});
test('scope rejects expanded payload while preserving story provenance',()=>{
  const idea=clone();idea.scope='IDEA';has(idea,'E_SCOPE_CONTENT');
  const only=clone();only.scope='STORY_ONLY';only.episodes=[];only.proposedScenes=[];has({...only,segments:[{}]},'E_SCOPE_CONTENT');
  const full=clone();full.scope='STORY_AND_EPISODES';has(full,'E_SCOPE_CONTENT');
  const story=clone();story.scope='STORY_ONLY';story.episodes=[];story.authorLocks=[];story.proposedScenes=[];story.segments=[];story.shots=[];story.cues=[];story.assets=[];assert.deepEqual(validate(story),[]);
});
test('shot duration totals cannot exceed segment and durations are positive finite',()=>{
  const d=clone();d.shots=[{id:'S1',segmentRef:'SEG01',durationSeconds:8},{id:'S2',segmentRef:'SEG01',durationSeconds:8}];d.segments[0].shotRefs=['S1','S2'];has(d,'E_SHOT_SUM');
  const x=clone();x.segments[0].durationSeconds=0;has(x,'E_TIMING');
  const y=clone();y.shots[0].durationSeconds=0;has(y,'E_TIMING');
});
test('AMBIENCE and BGM are valid sound cues with segment timing',()=>{
  const d=clone();d.cues.push({id:'AMB1',type:'AMBIENCE',source:'lobby room tone',segmentRef:'SEG01',startSeconds:0,endSeconds:12},{id:'BGM1',type:'BGM',source:'licensed score placeholder',segmentRef:'SEG01',startSeconds:0,endSeconds:12});d.segments[0].cueRefs.push('AMB1','BGM1');assert.deepEqual(validate(d),[]);
  const x=clone();x.cues[0].startSeconds=-1;has(x,'E_TIMING');
});
test('ADAPT_SOURCE ties scene source references to declared source id',()=>{
  const d=clone();d.scope='ADAPT_SOURCE';d.source={id:'SRC1',work:'Demo story',rightsBasis:'user supplied',authorizedScope:'synopsis',provenance:'user attached'};d.story.scenes[0].sourceRefs=[{sourceId:'SRC1',authorizedScope:'synopsis'}];d.story.digest=storyDigest(d.story);d.episodes[0].storyDigest=d.story.digest;d.proposedScenes[0].storyDigest=d.story.digest;assert.deepEqual(validate(d),[]);
  const x=structuredClone(d);x.story.scenes[0].sourceRefs[0].authorizedScope='full text';x.story.digest=storyDigest(x.story);x.episodes[0].storyDigest=x.story.digest;x.proposedScenes[0].storyDigest=x.story.digest;has(x,'E_SOURCE_REF');
});
test('L2 or canon changes require author approval; level is enumerated and approval is not production approval',()=>{
  const d=clone();d.proposedScenes[0].adaptationLevel='L2';has(d,'E_AUTHOR_APPROVAL_REQUIRED');
  d.proposedScenes[0].authorApproval=true;assert.deepEqual(validate(d),[]);
  const x=clone();x.proposedScenes[0].adaptationLevel='L1';x.proposedScenes[0].changesCanon=true;has(x,'E_AUTHOR_APPROVAL_REQUIRED');x.proposedScenes[0].authorApproval=true;assert.deepEqual(validate(x),[]);
  const y=clone();y.proposedScenes[0].adaptationLevel='L3';has(y,'E_ADAPTATION_LEVEL');
  const l0=clone();l0.proposedScenes[0].adaptationLevel='L0';assert.deepEqual(validate(l0),[]);
  const later=clone();later.proposedScenes[0].episodeId='EP04';assert.deepEqual(validate(later),[]);
  const invalidEpisode=clone();invalidEpisode.proposedScenes[0].episodeId='Episode 4';has(invalidEpisode,'E_EPISODE_REF');
  d.productionApproval='APPROVED';has(d,'E_STATUS_CLAIM');
});
test('manifest identity, plugin root skills path and README release claims stay explicit',async()=>{
  const a=JSON.parse(await readFile(new URL('../plugin.json',import.meta.url),'utf8')),b=JSON.parse(await readFile(new URL('../.codex-plugin/plugin.json',import.meta.url),'utf8'));
  assert.equal(a.name,'us-vertical-drama-studio3-lite');assert.equal(b.name,a.name);assert.equal(a.version,b.version);assert.equal(a.description,b.description);assert.deepEqual(a.extensions['com.openai'].interface.defaultPrompt,b.interface.defaultPrompt);assert.equal(b.skills,'./skills/');
  const readme=await readFile(new URL('../README.md',import.meta.url),'utf8');assert.match(readme,/# US Vertical Drama Studio 3/);assert.match(readme,/把中式爽剧的快节奏与强回报/);assert.match(readme,/https:\/\/github\.com\/jimwoocory\/US-Vertical-Drama-Studio2/);assert.match(readme,/https:\/\/github\.com\/jimwoocory\/US-Vertical-Drama-Studio3/);assert.match(readme,/License: \*\*TBD\*\*/);assert.match(readme,/不能判断美国社会逻辑、英语自然度、表演质量、来源权利/);assert.match(readme,/实际宿主安装\/加载尚未测试/);assert.match(readme,/不提供法律判断/);assert.match(readme,/schema version 1/);assert.doesNotMatch(readme,/Installed plugin name/);
  const skillNames=[];
  for(const skill of ['usvds3-controller','usvds3-localizer','usvds3-story-planner','usvds3-screenwriter','usvds3-review','usvds3-light-director']) {
    const body=await readFile(new URL(`../skills/${skill}/SKILL.md`,import.meta.url),'utf8'); const match=body.match(/^---\r?\nname:\s*([^\r\n]+)\r?\n/m); assert.ok(match,`${skill} needs frontmatter name`); assert.equal(match[1].trim(),skill); skillNames.push(match[1].trim());
    for(const ref of body.matchAll(/\]\((\.\.\/\.\.\/docs\/[^)]+)\)/g)) await readFile(new URL(`../skills/${skill}/${ref[1]}`,import.meta.url),'utf8');
  }
  assert.equal(new Set(skillNames).size,skillNames.length);
});
