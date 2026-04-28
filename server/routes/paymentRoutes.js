import express from 'express';
const router = express.Router();
import { createOrder, verifyPayment, createUpiPayment, checkPaymentStatus } from '../controllers/paymentController.js';

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/upi-pay', createUpiPayment);
router.get('/status/:payment_id', checkPaymentStatus);

export default router;
