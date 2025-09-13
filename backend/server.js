const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// In-memory storage for OTPs (in production, use Redis or a database)
const otpStore = new Map();

// Verify email configuration
const verifyEmailConfig = async () => {
    try {
        console.log('Verifying email configuration...');
        await transporter.verify();
        console.log('Email configuration is valid and ready to send OTPs');
    } catch (error) {
        console.error('Email configuration error:', error);
        // Don't throw the error, just log it
    }
};

// Email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.trim() // Trim to remove any accidental spaces
    },
    debug: true // Enable debug logs
});

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Login OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Login Verification</h2>
                <p>Your OTP for login is:</p>
                <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p style="color: #666;">This OTP will expire in 5 minutes.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Routes
// In your server.js, replace the send-otp route:
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { email, isSignup } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log('Sending OTP to:', email, 'isSignup:', isSignup);

        const otp = generateOTP();
        console.log('Generated OTP (for testing):', otp);

        // ✅ CREATE JWT TOKEN WITH OTP (instead of storing in Map)
        const otpToken = jwt.sign(
            { 
                email: email,
                otp: otp,
                isSignup: isSignup || false,
                attempts: 0,
                timestamp: Date.now()
            },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        // Send OTP
        await sendOTPEmail(email, otp);
        console.log('OTP email sent successfully');

        // ✅ RETURN THE TOKEN (not just message)
        res.json({ 
            message: 'OTP sent successfully',
            otpToken: otpToken  // ← Add this line
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            error: 'Failed to send OTP',
            details: error.message
        });
    }
});


app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp, otpToken } = req.body; // ← Add otpToken

        if (!otpToken) {
            return res.status(400).json({ error: 'OTP token is required' });
        }

        // ✅ VERIFY JWT TOKEN (instead of checking Map)
        let payload;
        try {
            payload = jwt.verify(otpToken, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({ error: 'OTP expired' });
            }
            return res.status(400).json({ error: 'Invalid token' });
        }

        // Check email match
        if (payload.email !== email) {
            return res.status(400).json({ error: 'Email mismatch' });
        }

        // Verify OTP
        if (payload.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Generate auth token
        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        );

        res.json({ token });
    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});


// Complete signup endpoint
// Complete signup endpoint - UPDATED for JWT-based approach
app.post('/api/auth/complete-signup', async (req, res) => {
    try {
        const { email, username, name, otp, otpToken } = req.body; // ← Add otpToken

        if (!otpToken) {
            return res.status(400).json({ error: 'OTP token is required' });
        }

        // ✅ VERIFY JWT TOKEN (instead of checking Map)
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
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        );

        res.json({ token, user });
    } catch (error) {
        console.error('Error completing signup:', error);
        res.status(500).json({ error: 'Failed to complete signup' });
    }
});


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        // Return full user info from JWT payload
        res.json({
            id: req.user.userId,
            email: req.user.email,
            // Add any other user info you want to expose
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    verifyEmailConfig();
});
