import { db } from "../config/firebaseAdmin.js";
import bcrypt from "bcryptjs";
import { generateTokens, setCookies } from "../lib/generateTokens.js";
import { ACCESS_TOKEN_SECRET, CLIENT_ID, CLIENT_SECRET, CLIENT_URL, NODE_ENV, REDIRECT_URI, REFRESH_TOKEN_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['profile', 'email', 'https://www.googleapis.com/auth/youtube.force-ssl'];

export const redirectGoogle = async (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
    res.redirect(authUrl);
};

export const authenticateGoogle = async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        res.cookie('googleAccessToken', tokens.access_token, {
            httpOnly: true, // prevent XSS attacks, cross site scripting attack
            secure: NODE_ENV === "production",
            sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const { data } = await oauth2.userinfo.get();
        const { email, name, id, picture } = data;

        let user = null;
        let userId = null;

        user = await db.collection("users").where("email", "=", email).limit(1).get();

        if (!user.empty) {
            userId = user.docs[0].id;
        }

        if (user.empty) {
            user = await db.collection("users").add({
                email,
                name,
                googleId: id,
                picture,
                isGoogleSignin: true
            });

            userId = user.id;
        }

        const { accessToken, refreshToken } = generateTokens(userId);
        setCookies(res, accessToken, refreshToken);

        res.redirect(CLIENT_URL);
    } catch (error) {
        console.log('Authenticate Google error:', error);
        res.status(500).json({ error: "Google authentication failed" });
    }
}

export const signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await db.collection("users").where("email", "=", email).limit(1).get();
        if (!existingUser.empty) {
            return res.status(400).json({ error: 'Email already exists' })
        }

        const genSalt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, genSalt);

        const userRef = db.collection("users").doc(); // create doc ref with auto ID
        const userId = userRef.id;

        await userRef.set({
            email,
            password: hashedPassword,
            isGoogleSignin: false,
            channel: {
                channelId: userId,
                name: '',
                displayName: `@${email.split('@')[0]}`,
                description: '',
                profileUrl: '',
                bannerUrl: ''
            }
        });

        const user = await db.collection("users").doc(userId).get();

        const { password: pw, ...otherData } = user.data();

        const { accessToken, refreshToken } = generateTokens(user.id);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({ message: "User signed up successfully", user: otherData });
    } catch (error) {
        console.log('Signup error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const login = async (req, res) => {
    const { email: emailPayload, password: passwordPayload } = req.body;

    try {
        const user = await db.collection("users").where("email", "=", emailPayload).get();

        if (user.empty) {
            return res.status(400).json({ error: 'Invalid email' })
        }

        const { password, ...otherData } = user.docs[0].data();

        const isPasswordValid = await bcrypt.compare(passwordPayload, password || '');

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' })
        }

        const { accessToken, refreshToken } = generateTokens(user.docs[0].id);
        setCookies(res, accessToken, refreshToken);

        res.status(200).json({ message: "User logged in successfully", user: otherData });
    } catch (error) {
        console.log('Login error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const logout = (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    if (req.cookies.googleAccessToken)
        res.clearCookie("googleAccessToken");

    res.status(200).json({ message: "User logged out successfully" });
}

export const getProfile = async (req, res) => {
    res.json({ user: req.user });
}

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.cookies;

    console.log(refreshToken)

    try {
        if (!refreshToken) {
            return res.status(403).json({ error: "Unauthorized - No refresh token" });
        }

        const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        if (!decodedToken || !decodedToken.userId) {
            return res.status(403).json({ error: "Unauthorized - Invalid refresh token" });
        }

        const user = await db.collection("users").doc(decodedToken.userId).get();

        if (!user.exists) {
            return res.status(403).json({ error: "Unauthorized - User not found" });
        }

        const accessToken = jwt.sign({ userId: decodedToken.userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevent XSS attacks, cross site scripting attack
            secure: NODE_ENV === "production",
            sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.json({ message: "Access token refreshed successfully" });
    } catch (error) {
        console.log('Refresh access token error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}