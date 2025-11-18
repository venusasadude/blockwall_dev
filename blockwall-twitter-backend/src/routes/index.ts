import { Router } from 'express';
import { router as overviewRouter } from '../modules/overview/overview.routes';
import { router as networkRouter } from '../modules/network/network.routes';
import { router as searchRouter } from '../modules/search/search.routes';
import { router as userRouter } from '../modules/user/user.routes';
export const router = Router();

/**
 * Routes grouped by domain/module.
 */
router.use('/overview', overviewRouter);
router.use('/network', networkRouter);
router.use('/search', searchRouter);
router.use('/user', userRouter);
