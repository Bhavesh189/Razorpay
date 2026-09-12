import express from 'express';
import { syncUserData, createOrder, getUserOrders } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/sync', protect, syncUserData);
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getUserOrders);

export default router;
