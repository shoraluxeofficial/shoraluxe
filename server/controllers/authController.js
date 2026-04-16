import { supabase } from '../config/db.js';
import { hashPasscode, verifyPasscode, generateToken, validatePasscodeFormat } from '../utils/authUtils.js';
import { sendEmailOTP } from '../utils/emailUtils.js';
import { sendSMS_OTP } from '../utils/smsUtils.js';

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

// Login with email + passcode (PIN)
export const loginWithEmail = async (req, res) => {
    const { email, passcode, deviceId } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(403).json({ error: 'Account temporarily locked. Try again later.' });
        }

        const isValid = await verifyPasscode(passcode, user.passcode_hash);
        if (!isValid) {
            let failedAttempts = (user.failed_login_attempts || 0) + 1;
            let lockedUntil = null;
            if (failedAttempts >= 5) {
                lockedUntil = new Date(Date.now() + 10 * 60000);
            }
            await supabase.from('users').update({ failed_login_attempts: failedAttempts, locked_until: lockedUntil }).eq('id', user.id);
            return res.status(401).json({ error: 'Invalid passcode' });
        }

        await supabase.from('users').update({ failed_login_attempts: 0, locked_until: null }).eq('id', user.id);

        const { data: device } = await supabase
            .from('devices')
            .select('*')
            .eq('user_id', user.id)
            .eq('device_id', deviceId)
            .single();

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

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// OAuth login (e.g., Google) - verfiy google credential token and upsert user
export const oauthLogin = async (req, res) => {
    const { credential, deviceId } = req.body;
    try {
        if (!credential) return res.status(400).json({ error: 'Google credential required' });

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        
        if (!email) return res.status(400).json({ error: 'Email required from Google auth' });

        // Upsert user by email
        const { data: existing, error: findError } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
        let user;
        if (existing) {
            // update provider id if missing
            await supabase.from('users').update({ name, mobile_verified: true }).eq('id', existing.id);
            user = { ...existing, name };
        } else {
            // Provide a dummy unique mobile number to bypass the database's NOT NULL constraint
            const dummyMobile = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
            const { data: inserted, error: insertError } = await supabase.from('users').insert([{ 
                name, 
                email, 
                mobile: dummyMobile, 
                mobile_verified: true 
            }]).select().single();
            
            if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
            user = inserted;
        }

        const token = generateToken(user.id, deviceId);
        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('OAuth Login Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Start Google OAuth flow by redirecting to Google's authorization endpoint
export const oauthStart = (req, res) => {
    console.log('oauthStart called, req.path=', req.path);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const serverRoot = process.env.SERVER_ROOT || `http://localhost:${process.env.PORT || 5000}`;
    const redirectUri = `${serverRoot}/api/auth/oauth/google/callback`;

    if (!clientId) {
        return res.status(500).send('Google OAuth not configured on server');
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent'
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(url);
};

// Callback handler for Google OAuth
export const oauthCallback = async (req, res) => {
    console.log('oauthCallback called, query=', req.query);
    const code = req.query.code;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const serverRoot = process.env.SERVER_ROOT || `http://localhost:${process.env.PORT || 5000}`;
    const redirectUri = `${serverRoot}/api/auth/oauth/google/callback`;

    if (!code) return res.status(400).send('Missing code');
    if (!clientId || !clientSecret) return res.status(500).send('Google OAuth not configured');

    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error(tokenData.error || 'Failed to exchange code');

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const profile = await profileRes.json();

        // Upsert user by email
        const email = profile.email;
        const name = profile.name || profile.email?.split('@')[0] || 'User';

        const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
        let user;
        if (existing) {
            await supabase.from('users').update({ name, mobile_verified: true }).eq('id', existing.id);
            user = { ...existing, name };
        } else {
            const { data: inserted } = await supabase.from('users').insert([{ name, email, mobile: null, mobile_verified: true }]).select().single();
            user = inserted;
        }

        const token = generateToken(user.id, null);

        const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
        // Redirect back to frontend with token (in prod, set secure cookie instead)
        res.redirect(`${frontend}/?token=${token}`);
    } catch (err) {
        console.error('Google OAuth callback error', err);
        res.status(500).send('OAuth callback error');
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

// --- REAL-TIME SMS OTP HANDLERS ---

export const sendOTP = async (req, res) => {
    const { mobile } = req.body;
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 5 * 60000); // 5 mins

        // Store OTP in database with type 'sms'
        // We use log entry to verify later. mobile is passed for identification.
        const { error } = await supabase.from('otp_logs').insert({
            type: 'sms',
            otp_code: otp,
            expiry_time: expiry,
            attempts: 0
        });

        if (error) throw error;

        // Strip +91 for Fast2SMS as it expects 10 digits
        const cleanMobile = mobile.replace('+91', '').trim();
        await sendSMS_OTP(cleanMobile, otp);
        
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('OTP Send Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const verifyOTP = async (req, res) => {
    const { mobile, otp } = req.body;
    try {
        // Find latest SMS OTP
        const { data: log, error } = await supabase
            .from('otp_logs')
            .select('*')
            .eq('type', 'sms')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !log || log.otp_code !== otp || new Date(log.expiry_time) < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Clean up
        await supabase.from('otp_logs').delete().eq('id', log.id);

        res.status(200).json({ message: 'Mobile verified' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
