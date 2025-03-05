
const express = require("express");
const jwt = require("jsonwebtoken");
const redis = require("redis");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 9099;

// Setup Redis Client
 const redisconnection = require('./redis_connection');


app.use(bodyParser.json());

const users = [{ id: 1, username: "myuser", password: "password123" }];

/**
 * 🔐 Generate Access & Refresh Tokens
 */
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, "ACCESS_SECRET", { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: userId }, "REFRESH_SECRET", { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

// blacklisted jwt token 
 
const blacklistJWT = async (token, expiryTime) => {
     
    await global.client.set(token, "blacklisted", "EX", expiryTime);
};


const isTokenBlacklisted = async (token) => {
    try {
        const data = await global.client.get(token);
        return data === "blacklisted";
    } catch (err) {
        console.error("Redis error:", err);
        throw err;
    }
};


/**
 * 🔍 Verify JWT Middleware
 */
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied" });

    if (await isTokenBlacklisted(token)) {
        return res.status(403).json({ message: "Token is blacklisted" });
    }

    try {
        req.user = jwt.verify(token,"ACCESS_SECRET");
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};


app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const tokens = generateTokens(user.id);
    res.json(tokens);
});


app.post("/logout", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token required" });

    const decoded = jwt.decode(token);
    const expiryTime = decoded.exp - Math.floor(Date.now() / 1000); // Time left until expiry

    await blacklistJWT(token, expiryTime);
    res.status(200).json({ message: "Logged out successfully", expiryTime:expiryTime });
});


// app.post("/refresh", async (req, res) => {
//     const { refreshToken } = req.body;
//     if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

//     try {
//         const decoded = jwt.verify(refreshToken, "REFRESH_SECRET");

//         if (await isTokenBlacklisted(refreshToken)) {
//             return res.status(403).json({ message: "Refresh token blacklisted" });
//         }

//         const tokens = generateTokens(decoded.id);
//         res.status(200).json(tokens);
//     } catch (err) {
//         res.status(401).json({ message: "Invalid refresh token" });
//     }
// });

/**
 * 🔐 Protected Route (Only Accessible with Valid JWT)
 */
app.get("/users", verifyToken, (req, res) => {
    console.log("GET verify token ", req.user);
    res.status(200).json({ message: "Protected data accessed!", user: req.user });
});

/**
 * 🚀 Start Server
 */

async function startServer(port) {
    await redisconnection()
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
 }
 startServer()
