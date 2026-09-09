import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectDb() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy server/.env.example to server/.env and fill it in.'
    );
  }

  client = new MongoClient(uri, {
    // Fail fast with a clear message instead of hanging for 30s when the
    // cluster is unreachable or the IP is not allow-listed in Atlas.
    serverSelectionTimeoutMS: 8000,
  });

  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'lof_titan');

  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(database) {
  await database.collection('users').createIndex({ email: 1 }, { unique: true });
  await database.collection('kit_content').createIndex({ kitId: 1 }, { unique: true });

  // A kit unit IS its serial - the unique index is what stops the same code
  // being redeemed twice or generated twice.
  await database.collection('kit_units').createIndex({ serial: 1 }, { unique: true });
  await database.collection('kit_units').createIndex({ kitId: 1, status: 1 });
  await database.collection('kit_units').createIndex({ assignedEmail: 1 });

  // The admin views read this newest-first, filtered by user or kit.
  await database.collection('access_log').createIndex({ at: -1 });
  await database.collection('access_log').createIndex({ userId: 1, at: -1 });
  await database.collection('access_log').createIndex({ kitId: 1, at: -1 });
  // The map groups by country+city over a time window.
  await database.collection('access_log').createIndex({ country: 1, city: 1, at: -1 });
}

export function getDb() {
  if (!db) throw new Error('Database not connected. Call connectDb() first.');
  return db;
}

export const users = () => getDb().collection('users');
export const kitContent = () => getDb().collection('kit_content');

/** Physical kits. One document per unit shipped, keyed by its printed serial. */
export const kitUnits = () => getDb().collection('kit_units');

/** Append-only audit trail: who opened which kit, when, and from where. */
export const accessLog = () => getDb().collection('access_log');

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
