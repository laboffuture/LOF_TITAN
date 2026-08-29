/**
 * Quick-fill hints for the sign-in form during the testing phase.
 *
 * These are DISPLAY ONLY - the real accounts live in MongoDB and are created by
 * `npm run seed` in server/. Authentication happens entirely server-side; this
 * list just saves typing while testing each entitlement case.
 *
 * Keep in sync with ACCOUNTS in server/src/seed.js. Delete this file once real
 * customers exist.
 */
import { AVAILABLE_KIT_IDS } from './kits';
export const TEST_ACCOUNTS = [
  {
    email: 'none@test',
    name: 'Nina (no kits)',
    kits: 0,
    caseLabel: 'Signed in, owns nothing - every kit locked, tools locked',
  },
  {
    email: 'single@test',
    name: 'Sam (one kit)',
    kits: 1,
    caseLabel: 'Owns Invisible Line Patrol only - the core customer case',
  },
  {
    email: 'multi@test',
    name: 'Maya (two kits)',
    kits: 2,
    caseLabel: 'Partial ownership - some kits unlocked, some locked',
  },
  {
    email: 'all@test',
    name: 'Alex (all kits)',
    kits: AVAILABLE_KIT_IDS.length,
    caseLabel: 'Owns everything - full access',
  },
];

/** Matches SEED_PASSWORD in server/src/seed.js. */
export const TEST_PASSWORD = 'titan1234';
