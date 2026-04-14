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
