import 'dotenv/config';
import { connectDb, accessLog, closeDb } from './db.js';
import { lookupGeo } from './geo.js';

/**
 * Adds city/region/country/ll to access_log rows written before geo existed.
 *
 * Safe to re-run: it only touches rows where `ll` is missing, so rows already
 * located are left alone and a second run costs one indexed query.
 *
 *   npm --prefix server run backfill:geo
 */
async function main() {
  await connectDb();
  console.log('Connected to MongoDB.');

  const cursor = accessLog().find({ ll: { $exists: false } }, { projection: { ip: 1 } });

  let scanned = 0;
  let located = 0;
  let ops = [];

  // Batched so a large log does not become one write per row.
  async function flush() {
    if (!ops.length) return;
    await accessLog().bulkWrite(ops, { ordered: false });
    ops = [];
  }

  for await (const row of cursor) {
    scanned += 1;
    const geo = lookupGeo(row.ip);
    if (geo) located += 1;

    ops.push({
      updateOne: {
        filter: { _id: row._id },
        // Write null explicitly rather than skipping unresolvable rows, so a
        // re-run does not scan them again forever.
        update: {
          $set: {
            city: geo?.city || null,
            region: geo?.region || null,
            country: geo?.country || null,
            ll: geo?.ll || null,
          },
        },
      },
    });

    if (ops.length >= 500) await flush();
  }
  await flush();

  console.log(`\nScanned ${scanned} row(s); located ${located}.`);
  if (scanned && !located) {
    console.log(
      'None resolved. That is expected for local testing (loopback and private\n' +
        'addresses have no location). In production it usually means TRUST_PROXY\n' +
        'is unset, so every row recorded the proxy address instead of the client.'
    );
  }

  await closeDb();
}

main().catch(async (err) => {
  console.error('\nBackfill failed:', err.message);
  await closeDb().catch(() => {});
  process.exit(1);
});
