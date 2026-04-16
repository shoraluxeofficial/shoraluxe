import express from 'express';
import { 
    registerUser, 
    setupPasscode, 
    loginWithPasscode,
    forgotPasscodeSendEmailOTP,
    resetPasscode,
    sendOTP,
    verifyOTP
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/setup-passcode', setupPasscode);
router.post('/login', loginWithPasscode);
router.post('/forgot-passcode', forgotPasscodeSendEmailOTP);
router.post('/reset-passcode', resetPasscode);
// SMS OTP endpoints temporarily disabled (commented out per frontend change request)
// router.post('/send-otp', sendOTP);
// router.post('/verify-backend-otp', verifyOTP);

// Email-based login and OAuth endpoints
import { loginWithEmail, oauthLogin, oauthStart, oauthCallback } from '../controllers/authController.js';
router.post('/email-login', loginWithEmail);
router.post('/oauth-login', oauthLogin);

// Server-side Google OAuth (start + callback)
router.get('/oauth/google', oauthStart);
router.get('/oauth/google/callback', oauthCallback);

export default router;
