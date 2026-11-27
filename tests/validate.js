#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. Extract and syntax-check inline <script>
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  console.error('FAIL: Could not find <script> block in index.html');
  process.exit(1);
}

const scriptSrc = match[1];
try {
  new Function(scriptSrc);
  console.log('PASS: Inline JavaScript syntax is valid.');
} catch (err) {
  console.error('FAIL: JavaScript syntax error:', err.message);
  process.exit(1);
}

// 2. Verify all registered characters follow the 100 HP & 4-skill contract
const registryMatch = scriptSrc.match(/const CHARACTER_REGISTRY = \{([\s\S]*?)\};/);
if (!registryMatch) {
  console.error('FAIL: CHARACTER_REGISTRY not found.');
  process.exit(1);
}

const configNames = [...registryMatch[1].matchAll(/new Character\((\w+)\)/g)].map((m) => m[1]);
if (configNames.length < 2) {
  console.error('FAIL: Expected at least 2 registered characters.');
  process.exit(1);
}

let failures = 0;
for (let i = 0; i < configNames.length; i++) {
  const cfgName = configNames[i];
  const startIdx = scriptSrc.indexOf(`const ${cfgName} = {`);
  if (startIdx === -1) {
    console.error(`FAIL: Missing config definition for ${cfgName}`);
    failures++;
    continue;
  }
  const nextMarker = i + 1 < configNames.length
    ? `const ${configNames[i + 1]} = {`
    : 'const CHARACTER_REGISTRY = {';
  const endIdx = scriptSrc.indexOf(nextMarker, startIdx);
  const snippet = scriptSrc.slice(startIdx, endIdx !== -1 ? endIdx : startIdx + 12000);
  if (!/maxHp:\s*100\b/.test(snippet)) {
    console.error(`FAIL: ${cfgName} does not have maxHp: 100`);
    failures++;
  }
  for (const reqSkill of ['passive(', 'skill1(', 'skill2(', 'ultimate(']) {
    if (!snippet.includes(reqSkill)) {
      console.error(`FAIL: ${cfgName} is missing required skill method ${reqSkill}`);
      failures++;
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`PASS: Verified ${configNames.length} characters (${configNames.join(', ')}) — all 100 HP & 4-skill compliant.`);
