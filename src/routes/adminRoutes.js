import { Router } from 'express';
import { 
  createSuperAdminHandler, 
  regenerateApiKeyHandler,
  listUsersHandler 
} from '../controllers/adminController.js';
import { adminApiKeyAuth } from '../middleware/adminMiddleware.js';

const router = Router();

// ✅ Create first super admin (no auth - run ONCE)
router.post('/super-admin', createSuperAdminHandler);

// ✅ Admin API key protected routes
router.post('/regenerate-key', adminApiKeyAuth, regenerateApiKeyHandler);
router.get('/users', adminApiKeyAuth, listUsersHandler);

export default router;
