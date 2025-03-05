
const jwt = require('jsonwebtoken');
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, "ACCESS_SECRET", { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: userId }, "REFRESH_SECRET", { expiresIn: "7d" });
    return { accessToken, refreshToken };
};


const isTokenBlacklisted = async (token) => {
    return new Promise((resolve, reject) => {
        global.client.get(token, (err, data) => {
            if (err) reject(err);
            resolve(data === "blacklisted");
        });
    });
};

exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied" });

    if (await isTokenBlacklisted(token)) {
        return res.status(403).json({ message: "Token is blacklisted" });
    }

    try {
        req.user = jwt.verify(token, "ACCESS_SECRET");
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};


const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    try {
        const decoded = jwt.verify(refreshToken, "REFRESH_SECRET");
        
        // Check if the refresh token is blacklisted
        if (await isTokenBlacklisted(refreshToken)) {
            return res.status(403).json({ message: "Refresh token blacklisted" });
        }

        // Generate new tokens
        const tokens = generateTokens(decoded.id);
        res.status(200).json(tokens);
    } catch (err) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
};

exports.logout = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token required" });

    const decoded = jwt.decode(token);
    const expiryTime = decoded.exp - Math.floor(Date.now() / 1000); // Time left until expiry

    await blacklistJWT(token, expiryTime);
    res.status(200).json({ message: "Logged out successfully" });
};


