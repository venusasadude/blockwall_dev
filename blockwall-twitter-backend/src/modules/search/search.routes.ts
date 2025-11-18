import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { search } from './search.service';

export const router = Router();

/**
 * GET /api/search
 *
 * Search for a specific user or hashtag by exact match.
 *
 * Query params:
 * - user?: exact screen_name (case-insensitive)
 * - hashtag?: exact hashtag name (case-insensitive)
 *
 * At most one user and one hashtag will be returned.
 * Frontend can safely assume:
 *   results.users.length <= 1
 *   results.hashtags.length <= 1
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userQuery = typeof req.query.user === 'string' ? req.query.user : undefined;

    const hashtagQuery =
      typeof req.query.hashtag === 'string' ? req.query.hashtag : undefined;

    const results = await search(userQuery, hashtagQuery);
    res.json(results);
  }),
);
