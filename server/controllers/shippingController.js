import { calculateShippingRate, pushOrderToShiprocket } from '../services/shiprocketService.js';

export const getShippingRate = async (req, res) => {
    try {
        const { pincode } = req.body;
        
        if (!pincode || pincode.length !== 6) {
            return res.status(400).json({ success: false, message: 'Invalid pincode' });
        }

        const result = await calculateShippingRate(pincode);
        
        if (result.success) {
            return res.status(200).json({ success: true, rate: result.rate });
        } else {
            return res.status(200).json({ success: false, message: result.message }); // Return 200 so frontend doesn't crash, just says "Unserviceable"
        }
    } catch (err) {
        console.error('getShippingRate Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const syncOrder = async (req, res) => {
    try {
        const orderPayload = req.body;
        if (!orderPayload || !orderPayload.orderId) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        const result = await pushOrderToShiprocket(orderPayload);
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (err) {
        console.error('syncOrder Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
