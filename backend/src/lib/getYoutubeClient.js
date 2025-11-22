import { google } from "googleapis";
import { oauth2Client } from "../config/oauth2Client.js";

export const getYoutubeClient = (access_token) => {
    if (!access_token) {
        throw new Error("Google access token is expired or missing.");
    }

    try {
        oauth2Client.setCredentials({ access_token });
        return google.youtube({
            version: 'v3',
            auth: oauth2Client
        });
    } catch (error) {
        console.error("Error creating YouTube client:", error);
        throw error;
    }
};