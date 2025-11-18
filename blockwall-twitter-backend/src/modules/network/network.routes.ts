import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { getNetwork } from './network.service';
import { NetworkRequestParams } from './network.types';

export const router = Router();

/**
 * GET /api/network
 *
 * Query params:
 * - user?: screen_name to focus on
 * - hashtag?: hashtag name to focus on
 * - minFollowers?: minimum number of followers for included users
 * - limit?: max number of tweets to include (default: 200)
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { user, hashtag, minFollowers, minHashtagUsage, limit } = req.query;

    const hasUser = typeof user === 'string';
    const hasHashtag = typeof hashtag === 'string';
    const rawLimit = typeof limit === 'string' ? parseInt(limit, 10) : undefined;
    const rawMinFollowers =
      typeof minFollowers === 'string' ? parseInt(minFollowers, 10) : undefined;
    const rawMinHashtagUsage =
      typeof minHashtagUsage === 'string' ? parseInt(minHashtagUsage, 10) : undefined;
    if (!hasUser && !hasHashtag) {
      return res.status(400).json({
        error:
          'Please provide either ?user=<screen_name> or ?hashtag=<name> to explore the network.',
      });
    }

    const params: NetworkRequestParams = {
      user: hasUser ? (user as string) : undefined,
      hashtag: hasHashtag ? (hashtag as string) : undefined,
      minFollowers: Number.isNaN(rawMinFollowers) ? undefined : rawMinFollowers,
      minHashtagUsage: Number.isNaN(rawMinHashtagUsage) ? undefined : rawMinHashtagUsage,
      limit: Number.isNaN(rawLimit) ? undefined : rawLimit,
    };

    const network = await getNetwork(params);
    res.json(network);
  }),
);
