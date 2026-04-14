import { supabase } from '../config/db.js';
import { hashPasscode, verifyPasscode, generateToken, validatePasscodeFormat } from '../utils/authUtils.js';
import { sendEmailOTP } from '../utils/emailUtils.js';

export const registerUser = async (req, res) => {
    try {
        const { name, mobile, email, initialPasscode } = req.body;
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .or(`mobile.eq.${mobile},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User with this mobile or email already exists' });
        }

        let passcodeHash = null;
        if (initialPasscode) {
            passcodeHash = await hashPasscode(initialPasscode);
        }

        // Initially create user (with hash if provided)
        const { data, error } = await supabase
            .from('users')
            .insert([{ name, mobile, email, passcode_hash: passcodeHash, mobile_verified: true }])
            .select()
            .single();

        if (error) throw error;
        
        res.status(201).json({ 
            message: 'User registered', 
            user: { id: data.id, name: data.name, email: data.email, mobile: data.mobile } 
        });
    } catch (error) {
        console.error('Server Internal Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const verifyFirebaseOTPAndRegister = async (req, res) => {
    // In actual implementation with Firebase, frontend validates Firebase OTP and 
    // sends the Firebase ID token here to be verified using firebase-admin.
    // For this flow, since frontend validates OTP with Firebase JS SDK, we'll assume valid payload if token is valid.
    const { mobile, firebaseUid, deviceId } = req.body; 

    try {
        // Mark user as mobile verified
        const { data, error } = await supabase
            .from('users')
            .update({ mobile_verified: true })
            .eq('mobile', mobile)
            .select().single();

        if (error) throw error;

        // Register device
        if (deviceId) {
            await supabase.from('devices').upsert({
                user_id: data.id,
                device_id: deviceId,
                is_trusted: true,
                last_login: new Date()
            }, { onConflict: 'user_id, device_id' });
        }

        res.status(200).json({ message: 'Mobile verified', userId: data.id });
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
};

export const setupPasscode = async (req, res) => {
    const { userId, passcode } = req.body;
    try {
        if (!validatePasscodeFormat(passcode)) {
            return res.status(400).json({ error: 'Invalid passcode format' });
        }
        
        const hashed = await hashPasscode(passcode);
        
        const { error } = await supabase
            .from('users')
            .update({ passcode_hash: hashed })
            .eq('id', userId);

        if (error) throw error;

        res.status(200).json({ message: 'Passcode setup successfully' });
    } catch (error) {
        console.error('Server Internal Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const loginWithPasscode = async (req, res) => {
    const { mobile, passcode, deviceId, checkOnly } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        // If we only wanted to check if user exists, stop here
        if (checkOnly) {
            return res.status(200).json({ message: 'User exists' });
        }

        // Check if locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(403).json({ error: 'Account temporarily locked. Try again later.' });
        }

        const isValid = await verifyPasscode(passcode, user.passcode_hash);
        if (!isValid) {
            let failedAttempts = (user.failed_login_attempts || 0) + 1;
            let lockedUntil = null;
            if (failedAttempts >= 5) {
                lockedUntil = new Date(Date.now() + 10 * 60000); // lock for 10 mins
            }
            await supabase.from('users').update({
                failed_login_attempts: failedAttempts,
                locked_until: lockedUntil
            }).eq('id', user.id);

            return res.status(401).json({ error: 'Invalid passcode' });
        }

        // Reset failed attempts
        await supabase.from('users').update({ failed_login_attempts: 0, locked_until: null }).eq('id', user.id);

        // Check device trust
        const { data: device } = await supabase
            .from('devices')
            .select('*')
            .eq('user_id', user.id)
            .eq('device_id', deviceId)
            .single();

        // For now, let's treat all successful passcode entries as trusted for easy UX
        if (!device) {
           await supabase.from('devices').insert([{ user_id: user.id, device_id: deviceId, is_trusted: true }]);
        }

        const token = generateToken(user.id, deviceId);
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile } });

    } catch (error) {
         console.error('Server Internal Error:', error);
         res.status(500).json({ error: error.message });
    }
};

export const forgotPasscodeSendEmailOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
        if (!user) return res.status(404).json({ error: 'Email not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60000);

        await supabase.from('otp_logs').insert({
            user_id: user.id,
            type: 'email',
            otp_code: otp, // In prod, hash this
            expiry_time: expiry
        });

        await sendEmailOTP(email, otp);
        res.status(200).json({ message: 'OTP sent to email', userId: user.id });
    } catch (error) {
        console.error('Server Internal Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const resetPasscode = async (req, res) => {
    const { userId, otp, newPasscode } = req.body;
    try {
        const { data: log, error } = await supabase
            .from('otp_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'email')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !log || log.otp_code !== otp || new Date(log.expiry_time) < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (!validatePasscodeFormat(newPasscode)) {
             return res.status(400).json({ error: 'Invalid passcode format' });
        }

        const hashed = await hashPasscode(newPasscode);
        await supabase.from('users').update({ passcode_hash: hashed }).eq('id', userId);
        
        // delete otp log
        await supabase.from('otp_logs').delete().eq('id', log.id);

        res.status(200).json({ message: 'Passcode reset successfully' });
    } catch (error) {
        console.error('Server Internal Error:', error);
        res.status(500).json({ error: error.message });
    }
};
