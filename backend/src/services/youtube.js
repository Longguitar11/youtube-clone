import axios from "axios";
import { YOUTUBE_API_KEY, YOUTUBE_ENDPOINT } from "../config/env.js";

export const youtubeService = async ({paramOptions, path}) => {
    const { data } = await axios.get(`${YOUTUBE_ENDPOINT}/${path}`, { params: {
        ...paramOptions,
        key: YOUTUBE_API_KEY
    }});

    return data;
}