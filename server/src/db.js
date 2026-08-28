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
}

export function getDb() {
  if (!db) throw new Error('Database not connected. Call connectDb() first.');
  return db;
}

export const users = () => getDb().collection('users');
export const kitContent = () => getDb().collection('kit_content');

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
