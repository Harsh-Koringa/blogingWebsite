const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

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
        const { email, username, name, otp, otpToken } = req.body;

        if (!otpToken || !otp || !email || !username || !name) {
            return res.status(400).json({ error: 'All fields are required' });
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

        // Verify OTP
        if (payload.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Check if this was a signup request
        if (!payload.isSignup) {
            return res.status(400).json({ error: 'This OTP was not generated for signup' });
        }

        // Create user object (in production, save to database)
        const user = {
            id: uuidv4(),
            email,
            username,
            name,
            createdAt: new Date().toISOString()
        };

        // Generate JWT token
        const authToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        return res.status(200).json({ token: authToken, user });

    } catch (error) {
        console.error('Error completing signup:', error);
        return res.status(500).json({ error: 'Failed to complete signup' });
    }
}
