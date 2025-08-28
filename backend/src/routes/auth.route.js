import { Router } from 'express';
import { authenticateGoogle, getProfile, login, logout, redirectGoogle, refreshAccessToken, signup } from '../controllers/auth.controller.js';
import { protectRoutes } from '../middlewares/protectRoutes.js';

const router = Router();

// LOGIN WITH GOOGLE
router.get('/google', redirectGoogle)
router.get('/google/callback', authenticateGoogle)

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh-token', refreshAccessToken)
router.get('/profile', protectRoutes, getProfile)

export default router;