import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
        console.log('Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET ? '[HIDDEN]' : 'MISSING');

        const options = {
            amount: Math.round(amount * 100), // convert to paisa
            currency,
            receipt,
        };
        console.log('Razorpay order options:', options);

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay Order Error Details:', error);
        res.status(500).json({ error: error.message || 'Razorpay creation failed' });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text.toString())
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ error: error.message });
    }
};
