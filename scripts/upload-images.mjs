import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import { readdirSync, existsSync, writeFileSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * Uploads kit imagery to Cloudinary and prints the path -> public-id mapping.
 *
 * Idempotent: `overwrite` updates an existing asset in place rather than
 * creating a duplicate, so this is safe to re-run whenever art changes.
 *
 *   node scripts/upload-images.mjs --dry    # show what would happen
 *   node scripts/upload-images.mjs          # actually upload
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_ASSETS = join(ROOT, 'webapp/public/assets');
const FOLDER = 'lof-titan';
const DRY = process.argv.includes('--dry');

// Files that ship as downscaled derivatives but have a higher-resolution
// master elsewhere in the repo. Upload the master and let Cloudinary derive
// every size, rather than uploading an already-lossy 1200px copy.
const HD_MASTERS = {
  'invisible-line/image (12).webp': 'webapp/src/assets/invisible-line/image (12).png',
  'invisible-line/image (13).webp': 'webapp/src/assets/invisible-line/image (13).png',
  'invisible-line/image (14).webp': 'webapp/src/assets/invisible-line/image (14).png',
};

// Small UI chrome where a CDN round-trip costs more than the bytes save. The
// nav logo (public/logo.webp) sits outside this folder and is never walked.
const KEEP_LOCAL = ['lab_of_future_logo.webp'];

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
    else if (/\.(webp|png|jpe?g)$/i.test(e.name)) out.push(p);
  }
  return out;
}

if (!process.env.CLOUDINARY_URL) {
  console.error('CLOUDINARY_URL is not set. Add it to .env at the repo root.');
  process.exit(1);
}
cloudinary.config({ secure: true });

const jobs = walk(PUBLIC_ASSETS)
  .map((file) => {
    const rel = relative(PUBLIC_ASSETS, file).replace(/\\/g, '/');
    const masterRel = HD_MASTERS[rel];
    const master = masterRel && existsSync(join(ROOT, masterRel)) ? join(ROOT, masterRel) : null;
    return {
      rel,
      source: master || file,
      usingMaster: Boolean(master),
      publicId: `${FOLDER}/${slug(rel)}`,
    };
  })
  .filter((j) => !KEEP_LOCAL.includes(j.rel));

console.log(`${jobs.length} images${DRY ? '  (DRY RUN - nothing will be uploaded)' : ''}\n`);

const done = [];
for (const j of jobs) {
  if (DRY) {
    console.log(`  ${j.rel}${j.usingMaster ? '  [HD master]' : ''}\n      -> ${j.publicId}`);
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
      `${String(Math.round(res.bytes / 1024)).padStart(5)}KB  ${j.rel}${j.usingMaster ? '  [HD master]' : ''}`
  );
}

if (DRY) {
  console.log('\nRe-run without --dry to upload.');
} else {
  const map = Object.fromEntries(done.map((d) => [`assets/${d.rel}`, d.publicId]));
  writeFileSync(join(ROOT, 'scripts/image-map.json'), JSON.stringify(map, null, 2));
  console.log(`\nWrote scripts/image-map.json (${done.length} entries) for the code migration.`);
}
