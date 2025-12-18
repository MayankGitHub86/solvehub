import { Router } from 'express';
import * as tagController from '../controllers/tag.controller';

const router = Router();

router.get('/', tagController.getAllTags);
router.get('/popular', tagController.getPopularTags);
router.get('/:id/questions', tagController.getQuestionsByTag);

export default router;
