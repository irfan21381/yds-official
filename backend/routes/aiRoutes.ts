import { Router } from 'express';
import { generalAIQuery } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// General AI queries can be accessed by any authenticated user
router.post('/query', protect, generalAIQuery);

export default router;