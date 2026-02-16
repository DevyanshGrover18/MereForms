import express from 'express';
const router = express.Router();
import { login, signup, getMe, getUsers } from '../controller/authController.js';

router.post('/login', login)
router.post('/signup', signup)
router.get('/me', getMe)
router.get('/users', getUsers)

export default router;