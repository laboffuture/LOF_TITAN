import 'dotenv/config';
import bcrypt from 'bcryptjs';

import { connectDb, users, kitContent, closeDb } from './db.js';
import { projects } from '../../webapp/src/projects.js';

/**
 * Seeds Atlas with the testing-phase accounts and the paid kit content.
 *
 * Idempotent: re-running updates rather than duplicating. Safe to run whenever
 * projects.js changes.
 *
 *   npm run seed
 */

// Fields that are PAID. Everything not listed here (hero, tagline, description,
// safety, components) stays public in projects.js as the store preview.
const GATED_FIELDS = ['assembly', 'code', 'faq', 'challenges'];

const TEST_PASSWORD = process.env.SEED_PASSWORD || 'titan1234';

const ACCOUNTS = [
  { email: 'none@test', name: 'Nina (no kits)', entitlements: [] },
  { email: 'single@test', name: 'Sam (one kit)', entitlements: ['invisible-line'] },
  { email: 'multi@test', name: 'Maya (two kits)', entitlements: ['invisible-line', 'heartbeat'] },
  { email: 'all@test', name: 'Alex (all kits)', entitlements: projects.map((p) => p.id) },
];

async function seedKitContent() {
  console.log('\nKit content');
  for (const p of projects) {
    const content = {};
    for (const f of GATED_FIELDS) {
      if (p[f] !== undefined) content[f] = p[f];
    }

    await kitContent().updateOne(
      { kitId: p.id },
      { $set: { kitId: p.id, name: p.name, ...content, updatedAt: new Date() } },
      { upsert: true }
    );

    const present = GATED_FIELDS.filter((f) => content[f] !== undefined);
    const size = Buffer.byteLength(JSON.stringify(content));
    console.log(`  ${p.id.padEnd(18)} ${String(size).padStart(7)} bytes  [${present.join(', ')}]`);
  }
}

async function seedUsers() {
  console.log('\nAccounts');
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  for (const a of ACCOUNTS) {
    await users().updateOne(
      { email: a.email },
      {
        $set: {
          email: a.email,
          name: a.name,
          entitlements: a.entitlements,
          passwordHash,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    console.log(
      `  ${a.email.padEnd(14)} ${String(a.entitlements.length)} kit(s)  [${a.entitlements.join(', ') || '-'}]`
    );
  }
}

async function main() {
  await connectDb();
  console.log('Connected to MongoDB.');

  await seedKitContent();
  await seedUsers();

  console.log(`\nAll test accounts share the password: ${TEST_PASSWORD}`);
  console.log('Change it with SEED_PASSWORD=... npm run seed\n');

  await closeDb();
}

main().catch(async (err) => {
  console.error('\nSeed failed:', err.message);
  await closeDb().catch(() => {});
  process.exit(1);
});
