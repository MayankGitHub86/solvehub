import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import * as voteController from '../controllers/vote.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('value').isIn([1, -1]).withMessage('Vote value must be 1 or -1')
  ],
  voteController.vote
);

export default router;
