import express from 'express';
import { getShippingRate, syncOrder } from '../controllers/shippingController.js';

const router = express.Router();

router.post('/calculate', getShippingRate);
router.post('/sync-order', syncOrder);

export default router;
