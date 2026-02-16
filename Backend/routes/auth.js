import express from 'express';
const router = express.Router();
import { login, signup, getMe } from '../controller/authController.js';

router.post('/login', login)
router.post('/signup', signup)
router.get('/me', getMe)

export default router;