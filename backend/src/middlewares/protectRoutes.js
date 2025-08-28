import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";
import { db } from "../config/firebaseAdmin.js";

export const protectRoutes = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;

        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized - No access token" });
        }

        try {
            const decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
            if (!decodedToken || !decodedToken.userId) {
                return res.status(401).json({ error: "Unauthorized - Invalid access token" });
            }

            const user = db.collection("users").doc(decodedToken.userId);

            if (!user) {
                return res.status(401).json({ error: "Unauthorized - User not found" });
            }

            const userData = (await user.get()).data();
            const { password, ...otherData } = userData;

            req.user = otherData;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ error: "Unauthorized: Token expired" });
            }

            throw error;
        }
    } catch (error) {
        console.log('Protect routes error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}