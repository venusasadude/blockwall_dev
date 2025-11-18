import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { getUserDetail } from './user.service';

export const router = Router();

/**
 * GET /api/user/:screenName
 *
 * Returns:
 * - user profile information
 * - recent tweets (with hashtags)
 */
router.get(
  '/:screenName',
  asyncHandler(async (req: Request, res: Response) => {
    const { screenName } = req.params;
    const limitParam = req.query.limit;
    const limit = typeof limitParam === 'string' ? Number(limitParam) : undefined;

    const detail = await getUserDetail(screenName, limit);
    if (!detail.user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(detail);
  }),
);
