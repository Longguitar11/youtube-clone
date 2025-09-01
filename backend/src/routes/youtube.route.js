import express from 'express';
import { protectRoutes } from '../middlewares/protectRoutes.js';
import {
    commentTopLevel, createPost, deletePost, editChannelProfile, editComment, editPost, getChannelById, getChannelsByIds, getDislikedCommentIds, getDislikedVideoIds, getFeaturedChannelVideos, getHistory,
    getLikedCommentIds, getLikedVideoIds, getMyLikedVideos, getMyPosts, getRelevantVideos, getRepliedComments, getReportedVideos, getReportReasons, getSubscriptionIds, getSubscriptions,
    getVideoById, getVideoComments, getVideos, getVideosfromChannel, ratingComment, ratingVideo, replyComment, reportVideo, searchVideos,
    subscribeChannel
} from '../controllers/youtube.controller.js';

const router = express.Router();

router.get('/videos', protectRoutes, getVideos);
router.get('/videos/relevant/:videoId', protectRoutes, getRelevantVideos);
router.get('/videos/liked', protectRoutes, getMyLikedVideos);
router.get('/videos/liked/id', protectRoutes, getLikedVideoIds);
router.get('/videos/:videoId', protectRoutes, getVideoById);
router.get('/videos/disliked/id', protectRoutes, getDislikedVideoIds);
router.get('/videos/comments/:videoId', protectRoutes, getVideoComments);
router.get('/videos/comments/replied/:videoId', protectRoutes, getRepliedComments);
router.get('/videos/comments/liked/id', protectRoutes, getLikedCommentIds);
router.get('/videos/comments/disliked/id', protectRoutes, getDislikedCommentIds);
router.post('/videos/comments/:videoId', protectRoutes, commentTopLevel)
router.post('/videos/comments/edit/:commentId', protectRoutes, editComment)
router.post('/videos/comments/reply/:videoId', protectRoutes, replyComment)
router.post('/rating/comments/:commentId', protectRoutes, ratingComment);
router.post('/rating/:videoId/:type', protectRoutes, ratingVideo);
router.get('/search', protectRoutes, searchVideos)
router.post('/subscriptions/:channelId', protectRoutes, subscribeChannel)
router.get('/subscriptions', protectRoutes, getSubscriptions)
router.get('/subscriptions/id', protectRoutes, getSubscriptionIds)
router.get('/channels/:channelId', protectRoutes, getChannelById)
router.get('/channels/ids/:channelIds', protectRoutes, getChannelsByIds)
router.get('/channels/featured/:channelId', protectRoutes, getFeaturedChannelVideos)
router.get('/channels/videos/:channelId', protectRoutes, getVideosfromChannel)
router.get('/history', protectRoutes, getHistory)
router.get('/reports/reasons', protectRoutes, getReportReasons)
router.get('/reports/videos', protectRoutes, getReportedVideos)
router.post('/reports/videos/:videoId', protectRoutes, reportVideo)
router.post('/channels/posts', protectRoutes, createPost)
router.get('/channels/posts/mine', protectRoutes, getMyPosts)
router.post('/channels/posts/:postId', protectRoutes, editPost)
router.delete('/channels/posts/:postId', protectRoutes, deletePost)
router.post('/channels/profile', protectRoutes, editChannelProfile)

export default router;
