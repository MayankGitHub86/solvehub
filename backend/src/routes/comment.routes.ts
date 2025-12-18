import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import * as commentController from '../controllers/comment.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('content').notEmpty().withMessage('Content is required')
  ],
  commentController.createComment
);
router.put('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);

export default router;
