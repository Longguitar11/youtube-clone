/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TextResponse } from "@/types/freedom"
import type { ChannelInterface, CommentInterface, CommentThreadInterface, PostInterface, PostType, QuizInterface, ReportedVideoInterface, ReportReasonInterface, YoutubeVideoInterface } from "@/types/youtube"
import api from "./api"

interface VideosResponse {
    result: {
        nextPageToken: string,
        pageInfo: {
            totalResults: number,
            resultsPerPage: number
        },
        items: YoutubeVideoInterface[]
    } | null
    error: string | null
}

export const getVideos = async (nextPageToken: string = ''): Promise<VideosResponse> => {
    try {
        const res = await api.get('/youtube/videos', { params: { pageToken: nextPageToken } });

        return { result: res.data, error: null };
    } catch (error) {
        return { result: null, error: (error as any).response.data.error };
    }
}

interface GetRelevantVideosProps {
    videoId: string
    channelId: string
    nextPageToken: string | undefined
}

export const getRelevantVideos = async ({ channelId, nextPageToken, videoId }: GetRelevantVideosProps): Promise<VideosResponse> => {
    try {
        const res = await api.get(`/youtube/videos/relevant/${videoId}`, { params: { channelId, pageToken: nextPageToken } });
        return { result: res.data, error: null };
    } catch (error) {
        return { result: null, error: (error as any).response.data.error };
    }
}

interface VideoResponse {
    video: YoutubeVideoInterface | null
    error: string | null
}

export const getVideoById = async (videoId: string): Promise<VideoResponse> => {
    try {
        const res = await api.get(`/youtube/videos/${videoId}`);
        return { video: res.data, error: null };
    } catch (error) {
        return { video: null, error: (error as any).response.data.error };
    }
}

export const ratingVideo = async ({ videoId, type }: { videoId: string, type: string }): Promise<TextResponse> => {
    try {
        const res = await api.post(`/youtube/rating/${videoId}/${type}`);

        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

interface YoutubeVideosResponse {
    videos: YoutubeVideoInterface[] | null
    error: string | null
}

export const getMyLikedVideos = async (): Promise<YoutubeVideosResponse> => {
    try {
        const res = await api.get('/youtube/videos/liked');
        return { videos: res.data, error: null };
    } catch (error) {
        return { videos: null, error: (error as any).response.data.error };
    }
}

export const getHistory = async (): Promise<YoutubeVideosResponse> => {
    try {
        const res = await api.get('/youtube/history');
        return { videos: res.data, error: null };
    } catch (error) {
        return { videos: null, error: (error as any).response.data.error };
    }
}

export const searchVideos = async (searchTerm: string, nextPageToken: string = ''): Promise<VideosResponse> => {
    try {
        const res = await api.get('/youtube/search', { params: { q: searchTerm, pageToken: nextPageToken } });

        return { result: res.data, error: null };
    } catch (error) {
        return { result: null, error: (error as any).response.data.error };
    }
}

interface GetIdsResponse {
    ids: string[] | []
    error: string | null
}

export const getSubscriptionIds = async (): Promise<GetIdsResponse> => {
    try {
        const res = await api.get(`/youtube/subscriptions/id`);
        return { ids: res.data, error: null };
    } catch (error) {
        return { ids: [], error: (error as any).response.data.error };
    }
}

interface SubscriptionsResponse {
    channels: ChannelInterface[] | ChannelInterface | null
    error: string | null
}

export const getSubscriptions = async (): Promise<SubscriptionsResponse> => {
    try {
        const res = await api.get('/youtube/videos');

        return { channels: res.data, error: null };
    } catch (error) {
        return { channels: null, error: (error as any).response.data.error };
    }
}

export const getChannelById = async (channelId: string): Promise<SubscriptionsResponse> => {
    try {
        const res = await api.get(`/youtube/channels/${channelId}`);

        return { channels: res.data, error: null };
    } catch (error) {
        return { channels: null, error: (error as any).response.data.error };
    }
}

interface ChannelVideosResponse {
    videos: YoutubeVideoInterface[] | null
    error: string | null
}

export const getFeaturedChannelVideos = async (channelId: string): Promise<ChannelVideosResponse> => {
    try {
        const res = await api.get(`/youtube/channels/featured/${channelId}`);
        const mappedVideos = res.data.map((video: any) => {
            const { snippet: { resourceId: { videoId } }, ...rest } = video;
            return ({ ...rest, snippet: { ...video.snippet }, id: videoId })
        }) as YoutubeVideoInterface[];

        return { videos: mappedVideos, error: null };
    } catch (error) {
        return { videos: null, error: (error as any).response.data.error };
    }
}

export const getVideosFromChannel = async (channelId: string, nextPageToken: string = ''): Promise<VideosResponse> => {
    try {
        const res = await api.get(`/youtube/channels/videos/${channelId}`, { params: { pageToken: nextPageToken } });
        const mappedVideos = res.data.items.map((video: any) => {
            const { snippet: { resourceId: { videoId } }, ...rest } = video;
            return ({ ...rest, snippet: { ...video.snippet }, id: videoId })
        }) as YoutubeVideoInterface[];

        return { result: { ...res.data, items: mappedVideos }, error: null };
    } catch (error) {
        return { result: null, error: (error as any).response.data.error };
    }
}

export const getChannelsByIds = async (channelIds: string[]): Promise<SubscriptionsResponse> => {
    try {
        const res = await api.get(`/youtube/channels/ids/${channelIds}`);

        return { channels: res.data, error: null };
    } catch (error) {
        return { channels: null, error: (error as any).response.data.error };
    }
}

export const getLikedVideoIds = async (): Promise<GetIdsResponse> => {
    try {
        const res = await api.get('/youtube/videos/liked/id');

        return { ids: res.data, error: null };
    } catch (error) {
        return { ids: [], error: (error as any).response.data.error };
    }
}

export const getDislikedVideoIds = async (): Promise<GetIdsResponse> => {
    try {
        const res = await api.get('/youtube/videos/disliked/id');

        return { ids: res.data, error: null };
    } catch (error) {
        return { ids: [], error: (error as any).response.data.error };
    }
}

interface VideoCommentsResponse {
    comments: CommentThreadInterface[] | CommentThreadInterface | null
    error: string | null
}

export const getVideoComments = async (videoId: string, order: 'time' | 'relevance'): Promise<VideoCommentsResponse> => {
    try {
        const res = await api.get(`/youtube/videos/comments/${videoId}`, { params: { order } });

        return { comments: res.data, error: null };
    }
    catch (error) {
        return { comments: null, error: (error as any).response.data.error };
    }
}

interface RepliedOtherCommentResponse {
    repliedOtherComments: Record<string, CommentInterface[]> | null
    error: string | null
}

export const getRepliedOtherComments = async (videoId: string): Promise<RepliedOtherCommentResponse> => {
    try {
        const res = await api.get(`/youtube/videos/comments/replied/${videoId}`);

        return { repliedOtherComments: res.data, error: null };
    } catch (error) {
        return { repliedOtherComments: null, error: (error as any).response.data.error };
    }
}

export const getLikedCommentIds = async (): Promise<GetIdsResponse> => {
    try {
        const res = await api.get('/youtube/videos/comments/liked/id');

        return { ids: res.data, error: null };
    } catch (error) {
        return { ids: [], error: (error as any).response.data.error };
    }
}

export const getDislikedCommentIds = async (): Promise<GetIdsResponse> => {
    try {
        const res = await api.get('/youtube/videos/comments/disliked/id');

        return { ids: res.data, error: null };
    } catch (error) {
        return { ids: [], error: (error as any).response.data.error };
    }
}

export const ratingComment = async ({ commentId, type }: { commentId: string, type: 'like' | 'dislike' }): Promise<TextResponse> => {
    try {
        const res = await api.post(`/youtube/rating/comments/${commentId}`, { type });

        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

export const commentTopLevel = async ({ videoId, channelId, text }: { videoId: string, channelId: string, text: string }): Promise<VideoCommentsResponse> => {
    try {
        const res = await api.post(`/youtube/videos/comments/${videoId}`, { text, channelId });

        return { comments: res.data, error: null };
    } catch (error) {
        return { comments: null, error: (error as any).response.data.error };
    }
}

interface ReplyMyCommentResponse {
    comment: CommentInterface | null
    error: string | null
}

export const replyComment = async ({ videoId, text, parentId, authorChannelId }: { videoId: string, text: string, parentId: string, authorChannelId: string }): Promise<ReplyMyCommentResponse> => {
    try {
        const res = await api.post(`/youtube/videos/comments/reply/${videoId}`, { text, parentId, authorChannelId });

        return { comment: res.data, error: null };
    } catch (error) {
        return { comment: null, error: (error as any).response.data.error };
    }
}

export const editComment = async ({ commentId, text, videoId, parentId }: { commentId: string, text: string, videoId: string, parentId?: string }): Promise<TextResponse> => {
    try {
        const res = await api.post(`/youtube/videos/comments/edit/${commentId}`, { videoId, text, parentId });
        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

export const subscribeChannel = async (channelId: string): Promise<TextResponse> => {
    try {
        const res = await api.post(`/youtube/subscriptions/${channelId}`);

        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

interface ReportReasonsResponse {
    reasons: ReportReasonInterface[] | null
    error: string | null
}

export const getReportReasons = async (): Promise<ReportReasonsResponse> => {
    try {
        const res = await api.get('/youtube/reports/reasons');
        return { reasons: res.data, error: null };
    } catch (error) {
        return { reasons: null, error: (error as any).response.data.error };
    }
}

interface GetReportedVideosResponse {
    reportedVideos: ReportedVideoInterface[] | null
    error: string | null
}

export const getReportedVideos = async (): Promise<GetReportedVideosResponse> => {
    try {
        const res = await api.get('/youtube/reports/videos');

        return { reportedVideos: res.data, error: null };
    } catch (error) {
        return { reportedVideos: null, error: (error as any).response.data.error };
    }
}

export const reportVideo = async ({ videoId, reasonId }: { videoId: string, reasonId: string }): Promise<TextResponse> => {
    try {
        const res = await api.post(`/youtube/reports/videos/${videoId}`, { reasonId });

        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

interface CreatePostInterface {
    id: string
    type: PostType
    text?: string
    images?: string[]
    quiz?: QuizInterface[]
}

export const createPost = async ({ id, type, text, images, quiz }: CreatePostInterface): Promise<TextResponse> => {
    try {
        const res = await api.post('/youtube/channels/posts', { id, type, text, images, quiz });

        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

interface PostResponse {
    posts: PostInterface[] | null
    error: string | null
}

export const getMyPosts = async (): Promise<PostResponse> => {
    try {
        const res = await api.get('/youtube/channels/posts/mine');
        return { posts: res.data, error: null };
    } catch (error) {
        return { posts: null, error: (error as any).response.data.error };
    }
}

export const editPost = async ({ text, postId }: { text: string, postId: string }): Promise<TextResponse> => {
    try {
        const res = await api.post(`/youtube/channels/posts/${postId}`, { text });
        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

export const deletePost = async ({ postId }: { postId: string }): Promise<TextResponse> => {
    try {
        const res = await api.delete(`/youtube/channels/posts/${postId}`);
        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

interface ChannelProfileProps {
    name: string
    displayName: string
    description: string
    profileUrl: string
    bannerUrl: string
}

export const editChannelProfile = async ({ name, displayName, description, profileUrl, bannerUrl }: ChannelProfileProps): Promise<TextResponse> => {
    try {
        const res = await api.post('/youtube/channels/profile', { name, displayName, description, profileUrl, bannerUrl });
        return { message: res.data.message, error: null };
    } catch (error) {
        return { message: null, error: (error as any).response.data.error };
    }
}

