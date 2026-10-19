import fs from 'fs';
import path from 'path';

const root = process.cwd();
const exts = new Set(['.jsx', '.js', '.tsx', '.ts']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (exts.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;

  src = src.replace(
    /^import React,\s*(\{[^}]+\})\s+from\s+['"]react['"];?\s*$/gm,
    "import $1 from 'react';",
  );
  src = src.replace(
    /^import React\s+from\s+['"]react['"];?\s*\n/gm,
    '',
  );

  if (src !== original) {
    fs.writeFileSync(file, src);
    changed += 1;
    console.log('updated', path.relative(root, file));
  }
}

console.log(`Updated ${changed} files`);
