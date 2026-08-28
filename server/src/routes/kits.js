import { Router } from 'express';
import { kitContent } from '../db.js';
import { requireUser } from '../session.js';

export const kitsRouter = Router();

/**
 * The paid content for one kit.
 *
 * This is the endpoint that actually protects revenue: assembly steps, firmware
 * source, FAQ and challenges are stored in MongoDB and returned ONLY to a user
 * whose entitlements include this kit. Nothing here ships in the public bundle.
 */
kitsRouter.get('/:kitId/content', requireUser, async (req, res) => {
  const { kitId } = req.params;

  const entitlements = req.user.entitlements || [];
  if (!entitlements.includes(kitId)) {
    // 403, not 404 - the kit exists, this user just hasn't bought it.
    return res.status(403).json({ error: 'NOT_ENTITLED', kitId });
  }

  const content = await kitContent().findOne({ kitId }, { projection: { _id: 0 } });
  if (!content) {
    return res.status(404).json({ error: 'KIT_CONTENT_NOT_FOUND', kitId });
  }

  res.json({ kitId, content });
});
