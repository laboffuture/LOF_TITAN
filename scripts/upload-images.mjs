import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { readdirSync, existsSync, writeFileSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * Uploads kit imagery to Cloudinary and prints the path -> public-id mapping.
 *
 * Sources come from art-masters/, which is GITIGNORED. That is deliberate: no
 * image bytes belong in this repo. Put the highest-resolution original you have
 * in there - Cloudinary derives every delivered size from it, so a 4000px master
 * costs nothing extra to store here and gives sharp output on large displays.
 *
 * Public ids are derived from the path relative to art-masters/, so the folder
 * layout IS the id scheme. Renaming a file changes its id and breaks the code
 * that references it.
 *
 *   node scripts/upload-images.mjs --dry    # show what would happen
 *   node scripts/upload-images.mjs          # actually upload
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, process.env.ART_MASTERS || 'art-masters');
const FOLDER = 'lof-titan';
const DRY = process.argv.includes('--dry');

// Cloudinary public ids cannot contain spaces or parentheses.
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9/]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(webp|png|jpe?g|avif|tiff?)$/i.test(e.name)) out.push(p);
  }
  return out;
}

if (!process.env.CLOUDINARY_URL) {
  console.error('CLOUDINARY_URL is not set. Add it to .env at the repo root.');
  process.exit(1);
}
if (!existsSync(SOURCE)) {
  console.error(`No art-masters/ directory at ${SOURCE}.`);
  console.error('Put your source images there (it is gitignored), or set ART_MASTERS.');
  process.exit(1);
}

cloudinary.config({ secure: true });

const jobs = walk(SOURCE).map((file) => {
  const rel = relative(SOURCE, file).split('\\').join('/');
  return { rel, source: file, publicId: `${FOLDER}/${slug(rel)}` };
});

// Two files that slug to the same id would silently overwrite each other.
const clashes = Object.entries(
  jobs.reduce((acc, j) => ((acc[j.publicId] ??= []).push(j.rel), acc), {})
).filter(([, v]) => v.length > 1);
if (clashes.length) {
  console.error('Public id collision - rename one of each pair:');
  clashes.forEach(([id, files]) => console.error(`  ${id}  <-  ${files.join(', ')}`));
  process.exit(1);
}

console.log(`${jobs.length} images${DRY ? '  (DRY RUN - nothing uploaded)' : ''}\n`);

const done = [];
for (const j of jobs) {
  if (DRY) {
    console.log(`  ${j.rel}\n      -> ${j.publicId}`);
    continue;
  }
  const res = await cloudinary.uploader.upload(j.source, {
    public_id: j.publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });
  done.push({ ...j, w: res.width, h: res.height, kb: Math.round(res.bytes / 1024) });
  console.log(
    `  ${String(res.width).padStart(4)}x${String(res.height).padEnd(5)}` +
      `${String(Math.round(res.bytes / 1024)).padStart(6)}KB  ${j.rel}`
  );
}

if (DRY) {
  console.log('\nRe-run without --dry to upload.');
} else {
  const map = Object.fromEntries(done.map((d) => [d.rel, d.publicId]));
  writeFileSync(join(ROOT, 'scripts/image-map.json'), JSON.stringify(map, null, 2));
  console.log(`\nWrote scripts/image-map.json (${done.length} entries).`);
}
