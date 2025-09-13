const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.trim()
    },
    debug: false
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

// Serverless function handler
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
        const { email, isSignup } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log('Sending OTP to:', email, 'isSignup:', isSignup);

        const otp = generateOTP();
        console.log('Generated OTP (for testing):', otp);

        // Create JWT token with OTP embedded (expires in 5 minutes)
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

        // Send OTP via email
        await sendOTPEmail(email, otp);
        console.log('OTP email sent successfully');

        // Return token to frontend (NOT the OTP)
        return res.status(200).json({ 
            message: 'OTP sent successfully',
            otpToken: otpToken  // Frontend will store this
        });

    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({
            error: 'Failed to send OTP',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
