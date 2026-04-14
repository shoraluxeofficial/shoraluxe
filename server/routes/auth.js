import express from 'express';
import { 
    registerUser, 
    verifyFirebaseOTPAndRegister, 
    setupPasscode, 
    loginWithPasscode,
    forgotPasscodeSendEmailOTP,
    resetPasscode
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyFirebaseOTPAndRegister);
router.post('/setup-passcode', setupPasscode);
router.post('/login', loginWithPasscode);
router.post('/forgot-passcode', forgotPasscodeSendEmailOTP);
router.post('/reset-passcode', resetPasscode);

export default router;
