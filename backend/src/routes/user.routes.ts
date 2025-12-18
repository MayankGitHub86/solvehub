import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:id', userController.getUserById);
router.get('/:id/stats', userController.getUserStats);
router.put('/:id', authenticate, userController.updateUser);

export default router;
