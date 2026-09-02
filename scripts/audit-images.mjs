import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * Cross-checks three lists that must agree:
 *
 *   1. public ids referenced in the app source
 *   2. images actually live on Cloudinary
 *   3. master files sitting in art-masters/
 *
 * A MISSING id is the dangerous case: the <img> onError fallback swaps in a
 * different kit's banner, so the page looks deliberate instead of broken and
 * nobody notices. Run this before every deploy.
 *
 *   node scripts/audit-images.mjs
 *
 * Exits non-zero when anything is missing, so CI can gate on it.
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'webapp/src');
const MASTERS = join(ROOT, process.env.ART_MASTERS || 'art-masters');
const ID_RE = /['"`](lof-titan\/[a-z0-9/-]+)['"`]/g;

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9/]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

function walk(dir, test, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, test, out);
    else if (test(e.name)) out.push(p);
  }
  return out;
}

// 1. referenced in code
const referenced = new Set();
for (const f of walk(SRC, (n) => /\.(jsx?|html)$/.test(n))) {
  for (const m of readFileSync(f, 'utf8').matchAll(ID_RE)) referenced.add(m[1]);
}
const indexHtml = join(ROOT, 'webapp/index.html');
if (existsSync(indexHtml)) {
  for (const m of readFileSync(indexHtml, 'utf8').matchAll(/(lof-titan\/[a-z0-9/-]+)/g)) {
    referenced.add(m[1]);
  }
}

// 2. live on Cloudinary
const live = new Set();
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
  let cursor;
  do {
    const r = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'lof-titan/',
      max_results: 500,
      next_cursor: cursor,
    });
    r.resources.forEach((x) => live.add(x.public_id));
    cursor = r.next_cursor;
  } while (cursor);
} else {
  console.error('CLOUDINARY_URL not set - skipping the live check.\n');
}

// 3. masters on disk
const masters = new Set(
  walk(MASTERS, (n) => /\.(webp|png|jpe?g|avif|tiff?)$/i.test(n)).map(
    (f) => `lof-titan/${slug(f.slice(MASTERS.length + 1).split('\\').join('/'))}`
  )
);

const missing = [...referenced].filter((r) => !live.has(r)).sort();
const orphaned = [...live].filter((l) => !referenced.has(l)).sort();
const unbacked = [...live].filter((l) => !masters.has(l)).sort();

console.log(`referenced in code : ${referenced.size}`);
console.log(`live on Cloudinary : ${live.size}`);
console.log(`masters on disk    : ${masters.size}`);

if (missing.length) {
  console.log(`\nMISSING - code points at these, they are NOT uploaded (${missing.length}):`);
  console.log('  add the file to art-masters/ then: node scripts/upload-images.mjs\n');
  for (const m of missing) {
    // Show the exact path that would produce this id.
    console.log(`  ${m}\n      art-masters/${m.replace('lof-titan/', '')}.webp`);
  }
}
if (orphaned.length) {
  console.log(`\nORPHANED - uploaded but unused, safe to delete (${orphaned.length}):`);
  orphaned.forEach((o) => console.log(`  ${o}`));
}
if (unbacked.length) {
  console.log(`\nNO LOCAL MASTER - live but not in art-masters/, cannot re-upload (${unbacked.length}):`);
  unbacked.forEach((u) => console.log(`  ${u}`));
}
if (!missing.length) console.log('\nAll referenced images are live.');

process.exit(missing.length ? 1 : 0);
