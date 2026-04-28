import express from 'express';
import { getShippingRate, syncOrder, notifyStatus } from '../controllers/shippingController.js';

const router = express.Router();

router.post('/calculate', getShippingRate);
router.post('/sync-order', syncOrder);
router.post('/notify-status', notifyStatus);

export default router;
