const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, otp, otpToken } = req.body;

        if (!otpToken || !otp || !email) {
            return res.status(400).json({ error: 'Email, OTP and token are required' });
        }

        // Verify and decode JWT
        let payload;
        try {
            payload = jwt.verify(otpToken, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({ error: 'OTP expired' });
            }
            return res.status(400).json({ error: 'Invalid token' });
        }

        // Check if email matches
        if (payload.email !== email) {
            return res.status(400).json({ error: 'Email mismatch' });
        }

        // Check attempts (optional - since JWT is stateless, this won't persist between calls)
        if (payload.attempts >= 3) {
            return res.status(400).json({ error: 'Too many attempts. Please request a new OTP' });
        }

        // Verify OTP
        if (payload.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Generate final auth token
        const authToken = jwt.sign(
            { email: email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        return res.status(200).json({ token: authToken });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ error: 'Failed to verify OTP' });
    }
}
