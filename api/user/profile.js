const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify JWT token
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }

            // Return user info from JWT payload
            return res.status(200).json({
                id: user.userId,
                email: user.email,
                // Add any other user info you want to expose
            });
        });

    } catch (error) {
        console.error('Error getting user profile:', error);
        return res.status(500).json({ error: 'Failed to get user profile' });
    }
}
