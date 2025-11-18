import { Router, Request, Response } from 'express';
import { getOverviewData } from './overview.service';
import { asyncHandler } from '../../shared/asyncHandler';

export const router = Router();

/**
 * GET /api/overview
 *
 * Returns:
 * - totals: users, tweets, hashtags
 * - topUsersByTweets: top 5 users by number of tweets
 * - topHashtags: most frequently used hashtags
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const overview = await getOverviewData();
    res.json(overview);
  }),
);
