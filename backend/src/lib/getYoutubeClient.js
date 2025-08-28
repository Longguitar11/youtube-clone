import { google } from "googleapis";
import { oauth2Client } from "../config/oauth2Client.js";

export const getYoutubeClient = (access_token) => {
    oauth2Client.setCredentials({ access_token });
    return google.youtube({
        version: 'v3',
        auth: oauth2Client
    });
};