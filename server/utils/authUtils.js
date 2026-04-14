import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export const hashPasscode = async (passcode) => {
    return await bcrypt.hash(passcode, SALT_ROUNDS);
};

export const verifyPasscode = async (passcode, hash) => {
    return await bcrypt.compare(passcode, hash);
};

export const generateToken = (userId, deviceId) => {
    return jwt.sign({ userId, deviceId }, process.env.JWT_SECRET || 'supersecretjwtkey', {
        expiresIn: '7d'
    });
};

export const validatePasscodeFormat = (passcode) => {
    if (!/^\d{4,6}$/.test(passcode)) return false;
    // Check consecutive or repeated
    const invalidPatterns = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '123456', '0123', '9876'];
    if (invalidPatterns.some(p => passcode.includes(p))) return false;
    return true;
};
