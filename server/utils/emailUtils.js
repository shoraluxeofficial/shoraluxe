import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendEmailOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'no-reply@shoraluxe.com',
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP to reset your passcode is: ${otp}. It will expire in 5 minutes.`
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email send error:', error);
    }
};

export const sendOrderConfirmationEmail = async (email, orderDetails) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'contact@shoraluxe.com',
            to: email,
            subject: `Order Confirmed: #${orderDetails.id.slice(0, 8).toUpperCase()} - Shoraluxe`,
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #6d0e2c;">Thank you for your order!</h2>
                <p>Hi ${orderDetails.customer_name},</p>
                <p>We've received your order and we're getting it ready for shipment.</p>
                
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Order Summary</h3>
                    <p><strong>Order ID:</strong> #${orderDetails.id.slice(0, 8).toUpperCase()}</p>
                    <p><strong>Total Amount:</strong> ₹${orderDetails.total_amount}</p>
                    <p><strong>Payment Method:</strong> ${orderDetails.payment_method}</p>
                </div>

                <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #92400e;">How to track your order:</h4>
                    <p style="margin-bottom: 5px;">You can track your package directly on our website anytime using:</p>
                    <ul style="padding-left: 20px; margin-top: 5px;">
                        <li><strong>Order ID:</strong> #${orderDetails.id.slice(0, 8).toUpperCase()}</li>
                        <li><strong>Your Email:</strong> ${email}</li>
                        <li><strong>Your Registered Phone Number</strong></li>
                    </ul>
                    <p style="margin-top: 10px;"><a href="https://shoraluxe.vercel.app/track-order" style="color: #6d0e2c; font-weight: bold;">Click here to Track Order →</a></p>
                </div>
                
                <p>We will notify you again once your order ships.</p>
                <p>Best regards,<br>The Shoraluxe Team</p>
            </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Order confirmation email error:', error);
    }
};

export const sendStatusUpdateEmail = async (email, orderDetails, status) => {
    try {
        let subject = `Order Update: #${orderDetails.id.slice(0, 8).toUpperCase()}`;
        let message = `Your order status has been updated to: <strong>${status}</strong>.`;
        
        if (status === 'shipped') {
            subject = `Your Shoraluxe Order is on the way! 🚚`;
            message = `Great news! Your order is on its way to you.<br><br>`;
            if (orderDetails.shiprocket_awb) {
                message += `<strong>Tracking AWB:</strong> ${orderDetails.shiprocket_awb}<br>`;
                message += `<a href="${orderDetails.tracking_url || `https://shiprocket.co/tracking/${orderDetails.shiprocket_awb}`}" style="display: inline-block; padding: 10px 20px; background: #6d0e2c; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">Track Package</a>`;
            }
        } else if (status === 'delivered') {
            subject = `Your Shoraluxe Order has been delivered! 🎉`;
            message = `Your package has been delivered successfully. We hope you love your products!`;
        }

        const mailOptions = {
            from: process.env.SMTP_FROM || 'contact@shoraluxe.com',
            to: email,
            subject: subject,
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #6d0e2c;">Order Status Update</h2>
                <p>Hi ${orderDetails.customer_name},</p>
                <p>${message}</p>
                
                <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #92400e;">Tracking Details:</h4>
                    <ul style="padding-left: 20px; margin-top: 5px;">
                        <li><strong>Website Order ID:</strong> #${orderDetails.id.slice(0, 8).toUpperCase()}</li>
                        <li><strong>Your Email / Phone</strong></li>
                        ${orderDetails.shiprocket_awb ? `<li><strong>Shiprocket AWB:</strong> ${orderDetails.shiprocket_awb}</li>` : ''}
                    </ul>
                    <p style="margin-top: 10px;"><a href="https://shoraluxe.vercel.app/track-order" style="color: #6d0e2c; font-weight: bold;">Track on our website →</a></p>
                </div>

                <br>
                <p>Best regards,<br>The Shoraluxe Team</p>
            </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Status update email error:', error);
    }
};
