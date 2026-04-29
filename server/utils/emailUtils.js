import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_PORT == '465'), // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps avoid certificate issues on some hosts
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
        const itemsHtml = (orderDetails.items || []).map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.product_img || item.img}" alt="${item.product_title || item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <div style="font-weight: bold; color: #333;">${item.product_title || item.title}</div>
                    <div style="font-size: 12px; color: #666;">Qty: ${item.quantity}</div>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #333;">
                    ₹${(item.price * item.quantity).toLocaleString('en-IN')}
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.SMTP_FROM || 'contact@shoraluxe.com',
            to: email,
            subject: `Order Confirmed: #${orderDetails.id.slice(0, 8).toUpperCase()} - Shoraluxe`,
            html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background: #6d0e2c; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">SHORALUXE</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #111827; margin-top: 0;">Thank you for your order!</h2>
                    <p style="color: #4b5563; line-height: 1.6;">Hi ${orderDetails.customer_name}, we've received your order <strong>#${orderDetails.id.slice(0, 8).toUpperCase()}</strong> and we're getting it ready for shipment.</p>
                    
                    <div style="margin: 25px 0;">
                        <h3 style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 15px;">Order Summary</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${itemsHtml}
                            <tr>
                                <td colspan="2" style="padding: 20px 10px 10px; text-align: right; color: #6b7280;">Subtotal:</td>
                                <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; color: #111827;">₹${orderDetails.total_amount?.toLocaleString('en-IN')}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Payment Method:</strong> ${orderDetails.payment_method?.toUpperCase()}</p>
                        <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;"><strong>Shipping Address:</strong> Verified</p>
                    </div>

                    <p style="margin-top: 30px; color: #4b5563; font-size: 14px;">We will notify you again with tracking details once your order ships.</p>
                    <p style="margin-top: 20px; border-top: 1px solid #f3f4f6; padding-top: 20px; color: #6b7280; font-size: 14px;">Best regards,<br><strong>The Shoraluxe Team</strong></p>
                </div>
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
        } else if (status === 'delivered') {
            subject = `Your Shoraluxe Order has been delivered! 🎉`;
            message = `Your package has been delivered successfully. We hope you love your products!`;
        }

        const itemsHtml = (orderDetails.items || []).map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${item.product_img || item.img}" alt="${item.product_title || item.title}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">
                    <div style="font-weight: bold; color: #333;">${item.product_title || item.title}</div>
                    <div style="color: #666;">Qty: ${item.quantity}</div>
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.SMTP_FROM || 'contact@shoraluxe.com',
            to: email,
            subject: subject,
            html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background: #6d0e2c; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">SHORALUXE</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #111827; margin-top: 0;">Order Update</h2>
                    <p style="color: #4b5563; line-height: 1.6;">Hi ${orderDetails.customer_name},</p>
                    <p style="color: #4b5563; line-height: 1.6;">${message}</p>
                    
                    ${orderDetails.items ? `
                    <div style="margin: 20px 0;">
                        <h4 style="font-size: 14px; text-transform: uppercase; color: #9ca3af; margin-bottom: 10px;">Items in this shipment:</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${itemsHtml}
                        </table>
                    </div>
                    ` : ''}

                    <div style="background: #fffbeb; padding: 25px; border-radius: 12px; border-left: 5px solid #f59e0b; margin: 30px 0;">
                        <h4 style="margin-top: 0; color: #92400e; font-size: 18px;">Tracking Information:</h4>
                        <ul style="padding-left: 20px; color: #4b5563; line-height: 1.8;">
                            <li><strong>Order ID:</strong> #${orderDetails.id.slice(0, 8).toUpperCase()}</li>
                            ${orderDetails.shiprocket_awb ? `<li><strong>Shiprocket AWB:</strong> ${orderDetails.shiprocket_awb}</li>` : ''}
                        </ul>
                        <div style="margin-top: 25px; text-align: center;">
                            <a href="https://shoraluxe.vercel.app/track-order" style="display: inline-block; padding: 14px 28px; background: #6d0e2c; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Track on Website →</a>
                        </div>
                    </div>

                    <p style="margin-top: 30px; color: #6b7280; font-size: 14px; border-top: 1px solid #f3f4f6; padding-top: 20px;">Best regards,<br><strong>The Shoraluxe Team</strong></p>
                </div>
            </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Status update email error:', error);
    }
};
