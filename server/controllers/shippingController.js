import { calculateShippingRate, pushOrderToShiprocket } from '../services/shiprocketService.js';
import { sendOrderConfirmationEmail, sendStatusUpdateEmail } from '../utils/emailUtils.js';
import { supabase } from '../utils/supabase.js';

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
            return res.status(200).json({ success: false, message: result.message }); 
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
            // Send order confirmation email
            if (orderPayload.email) {
                const orderDetails = {
                    id: orderPayload.orderId,
                    customer_name: orderPayload.firstName,
                    total_amount: orderPayload.amount,
                    payment_method: orderPayload.paymentMethod
                };
                await sendOrderConfirmationEmail(orderPayload.email, orderDetails);
            }
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (err) {
        console.error('syncOrder Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const notifyStatus = async (req, res) => {
    try {
        const { email, orderDetails, status } = req.body;
        if (!email || !orderDetails || !status) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }
        await sendStatusUpdateEmail(email, orderDetails, status);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('notifyStatus Error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const shiprocketWebhook = async (req, res) => {
    try {
        const payload = req.body;
        console.log('Received Shiprocket Webhook:', payload.current_status, 'for Order:', payload.order_id);

        if (!payload.order_id) return res.status(200).send('No order id');

        // Extract internal UUID (remove SHORA_ prefix)
        const orderUuid = payload.order_id.replace('SHORA_', '');
        
        // Fetch order details from Supabase
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderUuid)
            .single();

        if (fetchError || !order) {
            console.error('Webhook: Order not found in Supabase:', orderUuid);
            return res.status(200).send('Order not found');
        }

        const newStatus = payload.current_status.toLowerCase();
        let internalStatus = order.order_status;

        // Map Shiprocket status to our internal status
        // 6: Shipped, 7: Delivered, 13: Returned
        if (payload.current_status_id === 6 || newStatus === 'shipped') {
            internalStatus = 'shipped';
        } else if (payload.current_status_id === 7 || newStatus === 'delivered') {
            internalStatus = 'delivered';
        } else if (newStatus === 'canceled' || newStatus === 'cancelled') {
            internalStatus = 'cancelled';
        }

        // Only update if status has changed
        if (internalStatus !== order.order_status) {
            console.log(`Updating Order ${orderUuid} status from ${order.order_status} to ${internalStatus}`);
            
            const updates = { 
                order_status: internalStatus,
                shiprocket_awb: payload.awb_code || order.shiprocket_awb,
                tracking_url: payload.awb_code ? `https://shiprocket.co/tracking/${payload.awb_code}` : order.tracking_url
            };

            const { error: updateError } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', orderUuid);

            if (!updateError) {
                // Send email notification to customer
                try {
                    const orderDetails = {
                        id: order.id,
                        customer_name: order.customer_name,
                        shiprocket_awb: updates.shiprocket_awb,
                        tracking_url: updates.tracking_url
                    };
                    await sendStatusUpdateEmail(order.customer_email, orderDetails, internalStatus);
                    console.log(`Email sent for ${internalStatus} status update.`);
                } catch (emailErr) {
                    console.error('Webhook Email Error:', emailErr);
                }
            } else {
                console.error('Webhook DB Update Error:', updateError);
            }
        }

        return res.status(200).send('OK');
    } catch (err) {
        console.error('shiprocketWebhook Error:', err);
        return res.status(200).send('Error but OK'); // Always return 200 to Shiprocket to avoid retries
    }
};
