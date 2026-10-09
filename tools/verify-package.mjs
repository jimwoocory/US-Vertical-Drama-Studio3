#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const required=['plugin.json','.codex-plugin/plugin.json','.agents/plugins/marketplace.json','README.md','package.json','tools/checkup.mjs','tools/verify-package.mjs','tools/build-zip.mjs','test/checkup.test.mjs','test/fixtures/invalid-approval.json','docs/artifact-contract.md','docs/adaptation-method.md',...['controller','story-planner','localizer','screenwriter','review','light-director'].map(n=>`skills/usvds3-${n}/SKILL.md`)];
for(const rel of required) { try { await access(resolve(root,rel)); } catch { console.error(`E_PACKAGE_PATH missing ${rel}`); process.exitCode=1; } }
if(process.exitCode) process.exit();
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
const a=JSON.parse(await readFile(resolve(root,'plugin.json'),'utf8'));
const b=JSON.parse(await readFile(resolve(root,'.codex-plugin/plugin.json'),'utf8'));
const m=JSON.parse(await readFile(resolve(root,'.agents/plugins/marketplace.json'),'utf8'));
if(pkg.version!==a.version||a.version!==b.version||a.name!==b.name) throw new Error('E_PACKAGE_MANIFEST version/name mismatch');
const entry=m.plugins?.find(x=>x.name===a.name);
if(m.name!=='usvds3-dev'||entry?.source?.path!=='./'||entry?.source?.source!=='local'||entry?.policy?.installation!=='AVAILABLE'||entry?.policy?.authentication!=='ON_INSTALL'||entry?.category!=='Creative') throw new Error('E_PACKAGE_MARKETPLACE invalid repo-local marketplace entry');
const skillPath=resolve(root,b.skills);
if(!skillPath.startsWith(root+sep)) throw new Error('E_PACKAGE_PATH plugin skills path escapes repository');
console.log(`PASS package v${a.version}: manifests, marketplace, skills and linked docs present.`);
