const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for OTPs (in production, use Redis or a database)
const otpStore = new Map();

// Email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = generateOTP();

        // Store OTP with timestamp
        otpStore.set(email, {
            otp: await bcrypt.hash(otp, 10),
            timestamp: Date.now(),
            attempts: 0
        });

        // Send OTP
        await sendOTPEmail(email, otp);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ error: 'OTP expired or not sent' });
        }

        // Check if OTP is expired (5 minutes)
        if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP expired' });
        }

        // Check attempts
        if (storedData.attempts >= 3) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'Too many attempts. Please request a new OTP' });
        }

        // Increment attempts
        storedData.attempts += 1;
        otpStore.set(email, storedData);

        // Verify OTP
        const isValid = await bcrypt.compare(otp, storedData.otp);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Clear OTP after successful verification
        otpStore.delete(email);

        // Generate JWT token
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
app.post('/api/auth/complete-signup', async (req, res) => {
    try {
        const { email, username, name, otp } = req.body;
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(400).json({ error: 'OTP expired or not sent' });
        }

        // Check if OTP is expired (5 minutes)
        if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP expired' });
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, storedData.otp);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Clear OTP after successful verification
        otpStore.delete(email);

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
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
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

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
