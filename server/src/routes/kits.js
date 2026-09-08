import { Router } from 'express';
import { kitContent, kitUnits, users } from '../db.js';
import { requireUser, recordAccess, publicUser } from '../session.js';

export const kitsRouter = Router();

/**
 * The paid content for one kit.
 *
 * This is the endpoint that actually protects revenue: assembly steps, firmware
 * source, FAQ and challenges are stored in MongoDB and returned ONLY to a user
 * whose entitlements include this kit. Nothing here ships in the public bundle.
 *
 * Every hit is written to the audit trail, including refusals - a burst of
 * NOT_ENTITLED from one account is exactly what sharing a login looks like.
 */
kitsRouter.get('/:kitId/content', requireUser, async (req, res) => {
  const { kitId } = req.params;

  const entitlements = req.user.entitlements || [];
  if (!entitlements.includes(kitId)) {
    recordAccess(req, { kitId, action: 'content', allowed: false });
    // 403, not 404 - the kit exists, this user just hasn't bought it.
    return res.status(403).json({ error: 'NOT_ENTITLED', kitId });
  }

  const content = await kitContent().findOne({ kitId }, { projection: { _id: 0 } });
  if (!content) {
    return res.status(404).json({ error: 'KIT_CONTENT_NOT_FOUND', kitId });
  }

  recordAccess(req, { kitId, action: 'content', allowed: true });
  res.json({ kitId, content });
});

/** Serials are printed uppercase with dashes; accept whatever the user types. */
function normaliseSerial(input) {
  return String(input || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

/**
 * Redeem a printed kit serial for the entitlement it represents.
 *
 * This is how a paying customer unlocks a kit without anyone editing the
 * database by hand. The claim is done as a single atomic findOneAndUpdate
 * filtered on status, so two people racing the same code cannot both win it -
 * whoever loses the race sees ALREADY_REDEEMED rather than a silent double
 * grant.
 */
kitsRouter.post('/redeem', requireUser, async (req, res) => {
  const serial = normaliseSerial(req.body?.serial);
  if (!serial) {
    recordAccess(req, { kitId: null, action: 'redeem', allowed: false });
    return res.status(400).json({ error: 'SERIAL_REQUIRED' });
  }

  const unit = await kitUnits().findOne({ serial });
  if (!unit) {
    recordAccess(req, { kitId: null, action: 'redeem', allowed: false });
    // Same shape for unknown and already-used, so the endpoint can't be used to
    // probe which serials exist.
    return res.status(404).json({ error: 'SERIAL_NOT_FOUND' });
  }

  if (unit.status === 'activated') {
    recordAccess(req, { kitId: unit.kitId, action: 'redeem', allowed: false });
    const mine = String(unit.activatedByUserId) === String(req.user._id);
    return res.status(409).json({
      error: mine ? 'ALREADY_REDEEMED_BY_YOU' : 'ALREADY_REDEEMED',
      kitId: unit.kitId,
    });
  }

  const claimed = await kitUnits().findOneAndUpdate(
    { serial, status: { $ne: 'activated' } },
    {
      $set: {
        status: 'activated',
        activatedAt: new Date(),
        activatedByUserId: String(req.user._id),
        activatedByEmail: req.user.email,
      },
    },
    { returnDocument: 'after' }
  );

  const doc = claimed?.value ?? claimed;
  if (!doc) {
    recordAccess(req, { kitId: unit.kitId, action: 'redeem', allowed: false });
    return res.status(409).json({ error: 'ALREADY_REDEEMED', kitId: unit.kitId });
  }

  // $addToSet, not $push: redeeming a second serial for a kit the user already
  // owns must not duplicate the entitlement.
  await users().updateOne(
    { _id: req.user._id },
    { $addToSet: { entitlements: doc.kitId }, $set: { updatedAt: new Date() } }
  );

  const fresh = await users().findOne({ _id: req.user._id });
  recordAccess(req, { kitId: doc.kitId, action: 'redeem', allowed: true });

  res.json({ ok: true, kitId: doc.kitId, serial: doc.serial, user: publicUser(fresh) });
});
