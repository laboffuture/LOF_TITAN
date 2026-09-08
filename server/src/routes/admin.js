import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { users, kitUnits, accessLog } from '../db.js';
import { requireAdmin } from '../session.js';

export const adminRouter = Router();

// Every route below is admin-only. Mounted once here rather than repeated per
// route, so a new endpoint cannot accidentally ship unguarded.
adminRouter.use(requireAdmin);

const MAX_PAGE = 200;

function pageSize(raw, fallback = 50) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(MAX_PAGE, Math.floor(n));
}

/** Admin-facing shape. The password hash never leaves the database layer. */
function adminUser(u, lastSeen) {
  return {
    id: String(u._id),
    email: u.email,
    name: u.name,
    role: u.role === 'admin' ? 'admin' : 'user',
    entitlements: u.entitlements || [],
    createdAt: u.createdAt || null,
    lastSeenAt: lastSeen || null,
  };
}

/* ------------------------------------------------------------------ stats */

adminRouter.get('/stats', async (_req, res) => {
  const [userCount, adminCount, unitAgg, recent] = await Promise.all([
    users().countDocuments(),
    users().countDocuments({ role: 'admin' }),
    kitUnits()
      .aggregate([
        {
          $group: {
            _id: '$kitId',
            created: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'activated']] }, 1, 0] } },
            activated: { $sum: { $cond: [{ $eq: ['$status', 'activated'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    accessLog().countDocuments({ at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
  ]);

  const totals = unitAgg.reduce(
    (acc, r) => ({
      created: acc.created + r.created,
      delivered: acc.delivered + r.delivered,
      activated: acc.activated + r.activated,
    }),
    { created: 0, delivered: 0, activated: 0 }
  );

  res.json({
    users: userCount,
    admins: adminCount,
    accessLast24h: recent,
    units: totals,
    byKit: unitAgg.map((r) => ({
      kitId: r._id,
      created: r.created,
      delivered: r.delivered,
      activated: r.activated,
    })),
  });
});

/* ------------------------------------------------------------------ users */

adminRouter.get('/users', async (req, res) => {
  const limit = pageSize(req.query.limit);
  const q = String(req.query.q || '').trim();
  const filter = q
    ? { $or: [{ email: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }] }
    : {};

  const found = await users().find(filter).sort({ createdAt: -1 }).limit(limit).toArray();

  // One grouped query for last-seen rather than one per user, so the list does
  // not fan out into N round trips as the customer base grows.
  const ids = found.map((u) => String(u._id));
  const seen = await accessLog()
    .aggregate([{ $match: { userId: { $in: ids } } }, { $group: { _id: '$userId', last: { $max: '$at' } } }])
    .toArray();
  const lastSeen = Object.fromEntries(seen.map((s) => [s._id, s.last]));

  res.json({
    users: found.map((u) => adminUser(u, lastSeen[String(u._id)])),
    total: await users().countDocuments(filter),
  });
});

/** Grant or revoke one kit on one account. */
adminRouter.patch('/users/:id/entitlements', async (req, res) => {
  const { id } = req.params;
  const kitId = String(req.body?.kitId || '').trim();
  const action = String(req.body?.action || '');

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'INVALID_USER_ID' });
  if (!kitId) return res.status(400).json({ error: 'KIT_ID_REQUIRED' });
  if (action !== 'grant' && action !== 'revoke') {
    return res.status(400).json({ error: 'INVALID_ACTION' });
  }

  const update =
    action === 'grant' ? { $addToSet: { entitlements: kitId } } : { $pull: { entitlements: kitId } };

  const result = await users().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { ...update, $set: { updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  const doc = result?.value ?? result;
  if (!doc) return res.status(404).json({ error: 'USER_NOT_FOUND' });

  // Manual grants are part of the audit trail too - otherwise the log shows a
  // user opening a kit with no record of how they got it.
  accessLog()
    .insertOne({
      at: new Date(),
      userId: String(req.user._id),
      email: req.user.email,
      kitId,
      action: `admin:${action}`,
      allowed: true,
      targetUserId: id,
      targetEmail: doc.email,
      ip: req.ip || null,
      userAgent: String(req.get('user-agent') || '').slice(0, 300),
    })
    .catch(() => {});

  res.json({ user: adminUser(doc) });
});

/* ------------------------------------------------------------- kit units */

adminRouter.get('/units', async (req, res) => {
  const limit = pageSize(req.query.limit);
  const filter = {};
  if (req.query.kitId) filter.kitId = String(req.query.kitId);
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.q) filter.serial = { $regex: String(req.query.q).trim(), $options: 'i' };

  const [units, total] = await Promise.all([
    kitUnits().find(filter).sort({ createdAt: -1 }).limit(limit).toArray(),
    kitUnits().countDocuments(filter),
  ]);

  res.json({
    units: units.map((u) => ({
      serial: u.serial,
      kitId: u.kitId,
      status: u.status,
      note: u.note || '',
      assignedEmail: u.assignedEmail || null,
      activatedByEmail: u.activatedByEmail || null,
      createdAt: u.createdAt || null,
      deliveredAt: u.deliveredAt || null,
      activatedAt: u.activatedAt || null,
    })),
    total,
  });
});

/** Serial format: TITAN-<KIT>-<NNNN>, e.g. TITAN-ANEMOM-0007. */
function serialPrefix(kitId) {
  return kitId.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6);
}

adminRouter.post('/units', async (req, res) => {
  const kitId = String(req.body?.kitId || '').trim();
  const count = Number(req.body?.count);
  const note = String(req.body?.note || '').trim().slice(0, 200);

  if (!kitId) return res.status(400).json({ error: 'KIT_ID_REQUIRED' });
  if (!Number.isFinite(count) || count < 1 || count > 500) {
    return res.status(400).json({ error: 'INVALID_COUNT' });
  }

  // Continue the run rather than restarting at 1, so serials stay unique across
  // separate batches for the same kit.
  const existing = await kitUnits().countDocuments({ kitId });
  const prefix = serialPrefix(kitId);
  const now = new Date();

  const docs = [];
  for (let i = 0; i < count; i++) {
    docs.push({
      serial: `TITAN-${prefix}-${String(existing + i + 1).padStart(4, '0')}`,
      kitId,
      status: 'created',
      note,
      createdAt: now,
      createdByEmail: req.user.email,
    });
  }

  try {
    // ordered:false so one collision (a serial that somehow already exists)
    // does not abandon the rest of the batch.
    await kitUnits().insertMany(docs, { ordered: false });
  } catch (err) {
    if (err?.code !== 11000 && !err?.writeErrors) throw err;
  }

  const inserted = await kitUnits()
    .find({ serial: { $in: docs.map((d) => d.serial) } })
    .sort({ serial: 1 })
    .toArray();

  res.status(201).json({ created: inserted.length, serials: inserted.map((d) => d.serial) });
});

adminRouter.patch('/units/:serial', async (req, res) => {
  const serial = String(req.params.serial || '').trim().toUpperCase();
  const status = String(req.body?.status || '');
  const assignedEmail = req.body?.assignedEmail
    ? String(req.body.assignedEmail).trim().toLowerCase()
    : undefined;

  const set = { updatedAt: new Date() };
  if (status) {
    if (!['created', 'delivered'].includes(status)) {
      // 'activated' is set only by a customer redeeming the code. Letting an
      // admin set it by hand would make the delivered-vs-activated numbers lie.
      return res.status(400).json({ error: 'INVALID_STATUS' });
    }
    set.status = status;
    if (status === 'delivered') set.deliveredAt = new Date();
  }
  if (assignedEmail !== undefined) set.assignedEmail = assignedEmail;

  const result = await kitUnits().findOneAndUpdate(
    { serial, status: { $ne: 'activated' } },
    { $set: set },
    { returnDocument: 'after' }
  );

  const doc = result?.value ?? result;
  if (!doc) {
    const exists = await kitUnits().findOne({ serial });
    if (exists) return res.status(409).json({ error: 'ALREADY_ACTIVATED' });
    return res.status(404).json({ error: 'SERIAL_NOT_FOUND' });
  }

  res.json({ unit: { serial: doc.serial, kitId: doc.kitId, status: doc.status } });
});

/* ------------------------------------------------------------- audit log */

adminRouter.get('/access', async (req, res) => {
  const limit = pageSize(req.query.limit);
  const filter = {};
  if (req.query.kitId) filter.kitId = String(req.query.kitId);
  if (req.query.email) filter.email = String(req.query.email).trim().toLowerCase();
  if (req.query.action) filter.action = String(req.query.action);
  if (req.query.allowed === 'false') filter.allowed = false;

  const [entries, total] = await Promise.all([
    accessLog().find(filter).sort({ at: -1 }).limit(limit).toArray(),
    accessLog().countDocuments(filter),
  ]);

  res.json({
    entries: entries.map((e) => ({
      at: e.at,
      email: e.email,
      kitId: e.kitId,
      action: e.action,
      allowed: e.allowed,
      ip: e.ip,
      userAgent: e.userAgent,
      targetEmail: e.targetEmail || null,
    })),
    total,
  });
});
