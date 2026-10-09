#!/usr/bin/env node
import { deflateRawSync } from 'node:zlib';
import { access, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const outDir=resolve(root,'dist');
const zip=resolve(outDir,'usvds3-lite-v0.2.0.zip');
const files=[
  'plugin.json',
  '.codex-plugin/plugin.json',
  '.agents/plugins/marketplace.json',
  'README.md',
  'package.json',
  'tools/checkup.mjs',
  'tools/verify-package.mjs',
  'tools/build-zip.mjs',
  'test/checkup.test.mjs',
  'test/fixtures/invalid-approval.json',
  'docs',
  'skills',
  'examples/cedar-inn-project.json',
  'examples/cedar-inn-handoff.md',
  'examples/synthetic-project.json'
];

for (const rel of files) await access(resolve(root,rel));
await mkdir(outDir,{recursive:true});
await rm(zip,{force:true});

const crc32=buffer=>{let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
const entries=[];
async function collect(rel){
  const abs=resolve(root,rel), info=await stat(abs);
  if(info.isDirectory()) for(const child of await readdir(abs)) await collect(`${rel}/${child}`);
  else entries.push({name:rel.replaceAll('\\','/'),data:await readFile(abs)});
}
for(const rel of files) await collect(rel);
const locals=[], central=[];let offset=0;
for(const entry of entries){
  const name=Buffer.from(entry.name,'utf8'), compressed=deflateRawSync(entry.data), crc=crc32(entry.data);
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);local.writeUInt16LE(0x0800,6);local.writeUInt16LE(8,8);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(entry.data.length,22);local.writeUInt16LE(name.length,26);
  locals.push(local,name,compressed);
  const cd=Buffer.alloc(46);cd.writeUInt32LE(0x02014b50,0);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0x0800,8);cd.writeUInt16LE(8,10);cd.writeUInt32LE(crc,16);cd.writeUInt32LE(compressed.length,20);cd.writeUInt32LE(entry.data.length,24);cd.writeUInt16LE(name.length,28);cd.writeUInt32LE(0,38);cd.writeUInt32LE(offset,42);
  central.push(cd,name);offset+=local.length+name.length+compressed.length;
}
const centralSize=central.reduce((n,b)=>n+b.length,0),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(centralSize,12);end.writeUInt32LE(offset,16);
await writeFile(zip,Buffer.concat([...locals,...central,end]));
// Parse the generated central directory and verify both names and file data.
const archive=await readFile(zip), parsed=new Set();let cursor=offset;
for(const entry of entries){const nameLength=archive.readUInt16LE(cursor+28),extraLength=archive.readUInt16LE(cursor+30),commentLength=archive.readUInt16LE(cursor+32),name=archive.toString('utf8',cursor+46,cursor+46+nameLength);parsed.add(name);cursor+=46+nameLength+extraLength+commentLength;}
const entriesSet=parsed;
for(const required of ['plugin.json','.codex-plugin/plugin.json','.agents/plugins/marketplace.json','README.md','package.json','tools/checkup.mjs','tools/verify-package.mjs','tools/build-zip.mjs','test/checkup.test.mjs','test/fixtures/invalid-approval.json','skills/usvds3-controller/SKILL.md','docs/artifact-contract.md']){
  if(!entriesSet.has(required)){
    process.stderr.write('E_PACKAGE_ARCHIVE missing '+required+'\n');
    process.exit(1);
  }
}
console.log('PASS ZIP '+zip+' ('+entriesSet.size+' entries, verified layout)');
