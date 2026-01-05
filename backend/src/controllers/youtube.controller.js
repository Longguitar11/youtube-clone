import { getYoutubeClient } from "../lib/getYoutubeClient.js";
import { youtubeService } from "../services/youtube.js"
import { db } from "../config/firebaseAdmin.js"
import { mapCommentData, mapCommentThreadData } from "../lib/mapCommentThreadData.js";
import { transporter } from "../config/nodemailer.js";
import { MY_EMAIL, REPORT_HISTORY_URL, CLIENT_URL } from "../config/env.js";
import cloudinary from "../config/cloudinary.js";
import { uploadImages } from "../lib/uploadImages.js";


export const getVideos = async (req, res) => {
    const { isGoogleSignin } = req.user;
    const { pageToken } = req.query;

    try {
        const params = {
            part: 'snippet, statistics',
            chart: 'mostPopular',
            maxResults: 20,
            regionCode: 'VN',
        };

        if (pageToken) {
            params.pageToken = pageToken;
        }


        if (!isGoogleSignin) {
            const data = await youtubeService({
                paramOptions: params,
                path: 'videos'
            })

            res.json(data);
        }

        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);
            const { data } = await youtube.videos.list(params);

            res.json(data);
        }

    } catch (error) {
        console.log('Get videos error:', error);
        res.status(500).json({ message: 'Failed to fetch trending videos', error });
    }
}

export const getRelevantVideos = async (req, res) => {
    const { videoId } = req.params;
    const { pageToken, channelId } = req.query;

    try {
        const params = {
            part: 'snippet',
            channelId,
            maxResults: 20,
            type: 'video',
            regionCode: 'VN',
        };

        if (pageToken) {
            params.pageToken = pageToken;
        }

        const data = await youtubeService({
            paramOptions: params,
            path: 'search'
        })

        console.log('data from search:', data)

        let videoIds = data.items.map(item => item.id.videoId);

        // console.log('original videoIds:', videoIds)

        if (!videoIds || videoIds.length === 0) {
            return res.status(404).json({ message: 'No relevant videos found' });
        }

        if (videoIds.includes(videoId)) {
            videoIds = videoIds.filter(id => id !== videoId).join(',');
            // console.log('filtered videoIds:', videoIds)
        }
        else {
            videoIds = videoIds.join(',');
        }

        const video = await youtubeService({
            paramOptions: {
                part: 'snippet, statistics',
                id: videoIds,
                maxResults: 20,
                regionCode: 'VN',
            },
            path: 'videos'
        })

        res.json({ nextPageToken: data.nextPageToken, ...video });
    } catch (error) {
        console.log('Get relevant videos error:', error);
        res.status(500).json({ message: 'Failed to fetch relevant videos', error });
    }
}

export const getVideoById = async (req, res) => {
    const { videoId } = req.params;

    try {
        const { isGoogleSignin } = req.user;

        if (!isGoogleSignin) {
            const data = await youtubeService({
                paramOptions: {
                    part: 'snippet, statistics',
                    id: videoId
                },
                path: 'videos'
            })

            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const myHistoryRef = await user.docs[0].ref.collection('myHistory').doc(videoId).get();

            // add videoId to myHistory
            if (!myHistoryRef.exists) {
                await user.docs[0].ref.collection('myHistory').doc(videoId).set({watchedAt: new Date().toISOString()});
            }

            res.json(data.items[0]);
        }
        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);
            const { data } = await youtube.videos.list({
                part: 'snippet, statistics',
                id: videoId
            });

            res.json(data.items[0]);
        }

    } catch (error) {
        console.log('Get video by id error:', error);
        res.status(500).json({ message: 'Failed to fetch video', error });
    }
}

export const getHistory = async (req, res) => {
    const { isGoogleSignin } = req.user;
    try {
        if (!isGoogleSignin) {

            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const myHistory = await user.docs[0].ref.collection('myHistory').orderBy('watchedAt', 'desc').get();
            let historyData = myHistory.docs.map(doc => doc.id);

            historyData = [...historyData].join(',');

            const history = await youtubeService({
                paramOptions: {
                    part: 'snippet, statistics',
                    id: historyData
                },
                path: 'videos'
            })

            res.json(history.items);
        }
        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);
            const { data } = await youtube.videos.list({
                part: 'snippet, statistics',
            });

            res.json(data.items);
        }
    } catch (error) {
        console.log('Get history error:', error);
        res.status(500).json({ message: 'Failed to fetch history', error });
    }
}

export const getLikedVideoIds = async (req, res) => {
    try {
        const user = await db.collection('users').where('email', '==', req.user.email).get();

        if (user.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const myLikedVideoIds = await user.docs[0].ref.collection('myLikedVideoIds').get();
        const likedVideoIdsData = myLikedVideoIds.docs.map(doc => doc.id);

        res.json(likedVideoIdsData);
    } catch (error) {
        console.log('Get liked video ids error:', error);
        res.status(500).json({ message: 'Failed to fetch liked video ids', error });
    }
}

export const getDislikedVideoIds = async (req, res) => {
    try {
        const user = await db.collection('users').where('email', '==', req.user.email).get();

        if (user.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const myDislikedVideoIds = await user.docs[0].ref.collection('myDislikedVideoIds').get();
        const dislikedVideoIdsData = myDislikedVideoIds.docs.map(doc => doc.id);

        res.json(dislikedVideoIdsData);
    } catch (error) {
        console.log('Get disliked video ids error:', error);
        res.status(500).json({ message: 'Failed to fetch disliked video ids', error });
    }
}

export const getMyLikedVideos = async (req, res) => {
    console.log('get my liked videos')
    try {
        const { isGoogleSignin } = req.user;

        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const myLikedVideoIds = await user.docs[0].ref.collection('myLikedVideoIds').get();
            const likedVideoIdsData = myLikedVideoIds.docs.map(doc => doc.id);

            const likedVideoIds = [...likedVideoIdsData].join(',')

            const data = await youtubeService({
                paramOptions: {
                    part: 'snippet, statistics',
                    id: likedVideoIds
                },
                path: 'videos'
            })

            console.log(data)

            res.json(data.items);
        }
        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const { data } = await youtube.videos.list({
                part: 'snippet',
                myRating: 'like',
                maxResults: 20
            });

            res.json(data.items);
        }

    } catch (error) {
        console.log('Get my rating videos error:', error);
        res.status(500).json({ message: 'Failed to fetch my rating videos', error });
    }
}

export const getVideoComments = async (req, res) => {
    const { videoId } = req.params;
    const { order = 'relevance' } = req.query
    const { isGoogleSignin } = req.user

    try {
        if (!isGoogleSignin) {
            const data = await youtubeService({
                paramOptions: {
                    part: 'snippet, replies',
                    videoId,
                    maxResults: 100,
                    order
                },
                path: 'commentThreads'
            })

            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            // get my comments
            const myComment = await user.docs[0].ref.collection('myCommentVideos').doc(videoId).collection('myComments').get();

            console.log(myComment.docs.map(doc => doc.id));

            if (myComment.empty) {
                return res.json(data.items);
            }

            const myCommentData = await Promise.all(myComment.docs.map(async doc => {
                const repliesCollection = await doc.ref.collection('replies').get();

                if (repliesCollection.empty) {
                    return mapCommentThreadData(doc.data(), user.docs[0].data().channel);
                }

                const totalReplyCount = repliesCollection.size;

                const replies = repliesCollection.docs.map(replyDoc => mapCommentData(replyDoc.data(), user.docs[0].data().channel));

                return ({
                    ...mapCommentThreadData(doc.data(), user.docs[0].data().channel, totalReplyCount),
                    replies: { comments: replies }
                })
            }));

            const sortedMyCommentData = myCommentData.sort((a, b) =>
                new Date(b.snippet.topLevelComment.snippet.publishedAt) - new Date(a.snippet.topLevelComment.snippet.publishedAt)
            );

            res.json([...sortedMyCommentData, ...data.items]);
        } else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const { data } = await youtube.commentThreads.list({
                part: 'snippet, replies',
                videoId,
                maxResults: 100,
                order: 'relevance'
            });

            res.json(data.items);
        }
    } catch (error) {
        console.log('Get video comments error:', error);
        res.status(500).json({ message: 'Failed to fetch video comments', error });
    }
}

export const getRepliedComments = async (req, res) => {
    const { videoId } = req.params;

    try {
        const userSnap = await db.collection('users').where('email', '==', req.user.email).get();

        if (userSnap.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnap.docs[0];

        const myCommentVideosRef = userDoc.ref.collection('myCommentVideos').doc(videoId);

        const repliedCommentsSnap = await myCommentVideosRef.collection('repliedComments').get();

        if (repliedCommentsSnap.empty) {
            return res.json([]);
        }

        const repliedCommentsRecord = {};

        for (const doc of repliedCommentsSnap.docs) {
            const replyCollectionSnap = await doc.ref.collection('replies').get();

            if (!replyCollectionSnap.empty) {
                repliedCommentsRecord[doc.id] = replyCollectionSnap.docs.map(replyDoc => mapCommentData(replyDoc.data(), userDoc.data().channel));
            }
        }

        // const sortedReplies = myCommentData.sort((a, b) =>
        //     new Date(b.snippet.topLevelComment.snippet.publishedAt) - new Date(a.snippet.topLevelComment.snippet.publishedAt)
        // );

        res.json(repliedCommentsRecord);
    } catch (error) {
        console.log('Get video comments error:', error);
        res.status(500).json({ message: 'Failed to fetch video comments', error });
    }
}

export const getLikedCommentIds = async (req, res) => {
    try {
        const user = await db.collection('users').where('email', '==', req.user.email).get();

        if (user.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const myLikedCommentIds = await user.docs[0].ref.collection('myLikedCommentIds').get();
        const likedCommentIdsData = myLikedCommentIds.docs.map(doc => doc.id);

        res.json(likedCommentIdsData);
    } catch (error) {
        console.log('Get liked comment ids error:', error);
        res.status(500).json({ message: 'Failed to fetch liked comment ids', error });
    }
}

export const getDislikedCommentIds = async (req, res) => {
    try {
        const user = await db.collection('users').where('email', '==', req.user.email).get();

        if (user.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const myDislikedCommentIds = await user.docs[0].ref.collection('myDislikedCommentIds').get();
        const dislikedCommentIdsData = myDislikedCommentIds.docs.map(doc => doc.id);

        res.json(dislikedCommentIdsData);
    } catch (error) {
        console.log('Get disliked comment ids error:', error);
        res.status(500).json({ message: 'Failed to fetch disliked comment ids', error });
    }
}

export const commentTopLevel = async (req, res) => {
    const { videoId } = req.params
    const { text, channelId } = req.body;
    const { isGoogleSignin, email } = req.user

    try {
        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const userRef = user.docs[0].ref;

            const commentDoc = await userRef.collection('myCommentVideos').doc(videoId).collection('myComments').add({
                text,
                videoId,
                channelId,
                likeCount: 0,
                totalReplyCount: 0,
                publishedAt: new Date().toISOString()
            })

            commentDoc.set({ id: commentDoc.id }, { merge: true });

            const commentData = (await commentDoc.get()).data();

            res.json(mapCommentThreadData(commentData, user.docs[0].data().channel));
        } else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const { data } = await youtube.commentThreads.insert({
                part: 'snippet',
                resource: {
                    snippet: {
                        videoId,
                        topLevelComment: {
                            snippet: {
                                textOriginal: text
                            }
                        }
                    }
                }
            });

            res.json(data);
        }

    } catch (error) {
        console.log('Comment top level error:', error);
        res.status(500).json({ message: 'Failed to comment top level', error });
    }
}

export const replyComment = async (req, res) => {
    const { videoId } = req.params
    const { text, parentId, authorChannelId } = req.body;
    const { isGoogleSignin } = req.user

    try {
        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const channel = user.docs[0].data().channel;

            const userRef = user.docs[0].ref;

            let commentDoc;

            if (authorChannelId === channel.channelId) {
                console.log('reply my comment')
                commentDoc = await userRef.collection('myCommentVideos').doc(videoId).collection('myComments').doc(parentId).collection('replies').add({
                    videoId, text, likeCount: 0, parentId, publishedAt: new Date().toISOString()
                });
            } else {
                console.log('reply other comment')
                const repliedCommentsRef = userRef.collection('myCommentVideos').doc(videoId).collection('repliedComments').doc(parentId)

                await repliedCommentsRef.set({ exists: true }, { merge: true });

                commentDoc = await repliedCommentsRef.collection('replies').add({
                    videoId, text, parentId, likeCount: 0, publishedAt: new Date().toISOString()
                });
            }

            await commentDoc.set({ id: commentDoc.id }, { merge: true });

            const { id, videoId: vdId, text: commentText, likeCount, publishedAt } = (await commentDoc.get()).data();

            res.json({
                kind: 'youtube#comment',
                id,
                snippet: {
                    videoId: vdId,
                    parentId,
                    textOriginal: commentText,
                    likeCount,
                    publishedAt,
                    authorDisplayName: channel.displayName,
                    authorProfileImageUrl: channel.profileUrl,
                    authorChannelUrl: channel.channelUrl,
                    authorChannelId: { value: channel.channelId },
                }
            });
        } else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const { data } = await youtube.comments.insert({
                part: 'snippet',
                resource: {
                    snippet: {
                        parentId,
                        textOriginal: text
                    }
                }
            });

            res.json(data);
        }

    } catch (error) {
        console.log('Reply comment error:', error);
        res.status(500).json({ message: 'Failed to reply comment', error });
    }
}

export const editComment = async (req, res) => {
    const { commentId } = req.params;
    const { text, parentId, videoId } = req.body;
    const { isGoogleSignin } = req.user

    console.log(commentId, text, parentId, videoId)

    try {
        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const userRef = user.docs[0].ref;

            if (parentId) {
                const repliedMyCommentsRef = userRef.collection('myCommentVideos').doc(videoId).collection('myComments').doc(parentId).collection('replies').doc(commentId);

                if (!repliedMyCommentsRef.empty) {
                    console.log('update my replied comment')
                    await repliedMyCommentsRef.set({ text }, { merge: true });
                }

                const repliedOtherCommentsRef = userRef.collection('myCommentVideos').doc(videoId).collection('repliedComments').doc(parentId).collection('replies').doc(commentId);

                if (!repliedOtherCommentsRef.empty) {
                    console.log('update other replied comment')
                    await repliedOtherCommentsRef.set({ text }, { merge: true });
                }
            }
            else {
                // MY COMMENTS
                const myCommentsRef = userRef.collection('myCommentVideos').doc(commentId).collection('myComments').doc(commentId);

                if (!myCommentsRef.empty) {
                    console.log('update my comment')
                    await myCommentsRef.set({ text }, { merge: true });
                }
            }

            res.json({ message: 'Comment edited successfully' });
        } else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const { data } = await youtube.comments.update({
                part: 'snippet',
                resource: {
                    id: commentId,
                    snippet: {
                        textOriginal: text
                    }
                }
            });

            res.json(data);
        }
    }
    catch (error) {
        console.log('Edit comment error:', error);
        res.status(500).json({ message: 'Failed to edit comment', error });
    }
}

export const ratingComment = async (req, res) => {
    const { commentId } = req.params;
    const { type } = req.body;
    const { isGoogleSignin } = req.user

    try {
        if (type !== 'like' && type !== 'dislike' && type !== 'none') {
            return res.status(400).json({ message: 'Invalid type' });
        }

        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const userRef = user.docs[0].ref;
            const myLikedCommentIdsDoc = userRef.collection('myLikedCommentIds').doc(commentId);
            const myDislikedCommentIdsDoc = userRef.collection('myDislikedCommentIds').doc(commentId);

            const likedCommentId = await myLikedCommentIdsDoc.get();
            const dislikedCommentId = await myDislikedCommentIdsDoc.get();

            if (type === 'like') {
                if (likedCommentId.exists) {
                    await myLikedCommentIdsDoc.delete();
                } else {
                    if (dislikedCommentId.exists) {
                        await myDislikedCommentIdsDoc.delete();
                    }
                    await myLikedCommentIdsDoc.set({});
                }
            } else if (type === 'dislike') {
                if (dislikedCommentId.exists) {
                    await myDislikedCommentIdsDoc.delete();
                } else {
                    if (likedCommentId.exists) {
                        await myLikedCommentIdsDoc.delete();
                    }
                    await myDislikedCommentIdsDoc.set({});
                }
            }

            res.json({ message: 'Rating comment successfully' });
        } else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const { data } = await youtube.commentThreads.rate({
                id: commentId,
                rating: type
            });

            res.json(data);
        }
    } catch (error) {
        console.log('Rating comment error:', error);
        res.status(500).json({ message: 'Failed to rate comment', error });
    }
}

export const ratingVideo = async (req, res) => {
    const { videoId, type } = req.params;

    try {
        if (type !== 'like' && type !== 'dislike' && type !== 'none') {
            return res.status(400).json({ message: 'Invalid type' });
        }

        const { isGoogleSignin } = req.user;

        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const userRef = user.docs[0].ref;
            const myLikedVideoIdsDoc = userRef.collection('myLikedVideoIds').doc(videoId);
            const myDislikedVideoIdsDoc = userRef.collection('myDislikedVideoIds').doc(videoId);

            const likedVideoId = await myLikedVideoIdsDoc.get();
            const dislikedVideoId = await myDislikedVideoIdsDoc.get();

            if (type === 'like') {
                if (!likedVideoId.exists) { // If videoId doesn't exist in myLikedVideoIds, ADD videoId to myLikedVideoIds
                    if (dislikedVideoId.exists) { // If videoId exists in myDislikedVideoIds, remove it
                        await myDislikedVideoIdsDoc.delete();
                    }

                    await myLikedVideoIdsDoc.set({ videoId });
                }
                else {
                    await myLikedVideoIdsDoc.delete();
                }
            }
            else if (type === 'dislike') {
                if (!dislikedVideoId.exists) {
                    if (likedVideoId.exists) {
                        await myLikedVideoIdsDoc.delete();
                    }

                    await myDislikedVideoIdsDoc.set({ videoId });
                }
                else
                    await myDislikedVideoIdsDoc.delete();
            }

            res.json({ message: `Rated video successfully` });
        }

        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            await youtube.videos.rate({
                id: videoId,
                rating: type
            });

            res.json({ message: `${type === 'none' ? 'Removed rating' : type === 'like' ? 'Liked' : 'Disliked'} video successfully` });
        }

    } catch (error) {
        console.log('Rating video error:', error);
        res.status(500).json({ message: 'Failed to rate video', error });
    }
}

export const searchVideos = async (req, res) => {
    const { q, pageToken } = req.query;

    try {
        if (!q) {
            return res.status(400).json({ message: 'Missing query parameter' });
        }

        const { isGoogleSignin } = req.user;

        const params = {
            part: 'snippet',
            type: 'video',
            maxResults: 20,
            regionCode: 'VN',
            q
        };

        if (pageToken) {
            params.pageToken = pageToken;
        }

        if (!isGoogleSignin) {
            const data = await youtubeService({
                paramOptions: params,
                path: 'search'
            });

            const videoIds = data.items.map(item => item.id.videoId).join(',');

            const video = await youtubeService({
                paramOptions: {
                    part: 'snippet, statistics',
                    id: videoIds
                },
                path: 'videos'
            })

            res.json(video);
        }

        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const { data } = await youtube.search.list(params);

            res.json(data);
        }

    } catch (error) {
        console.log('Error searching videos:', error);
        res.status(500).json({ message: 'Failed to search videos', error });
    }
}

export const subscribeChannel = async (req, res) => {
    const { channelId } = req.params;

    try {
        const { isGoogleSignin } = req.user;

        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            const userRef = user.docs[0].ref;
            const subscriptionIdsDoc = userRef.collection('mySubscriptionIds').doc(channelId);

            let typeSub = 'Subscribed';

            if (!((await subscriptionIdsDoc.get()).exists)) {
                await subscriptionIdsDoc.set({ channelId });
            }
            else {
                typeSub = 'Unsubscribed';
                await subscriptionIdsDoc.delete();
            }

            res.json({ message: `${typeSub} to channel successfully` });
        }

        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);

            const response = await youtube.subscriptions.list({
                part: 'id',
                forChannelId: channelId,
                mine: true
            });

            console.log('response:', response.data.items)

            if (response.data.items.length > 0) {
                console.log('Unsubscribe channel')
                await youtube.subscriptions.delete({
                    id: response.data.items[0].id
                });

                return res.json({ message: 'Unsubscribed from channel successfully' });
            }

            else {
                console.log('Subscribe channel')
                await youtube.subscriptions.insert({
                    part: 'snippet',
                    requestBody: {
                        snippet: {
                            resourceId: {
                                kind: 'youtube#channel',
                                channelId
                            }
                        }
                    }
                });

                res.json({ message: 'Subscribed to channel successfully' });
            }
        }

    } catch (error) {
        console.log('Subscribe channel error:', error);
        res.status(500).json({ message: 'Failed to subscribe to channel', error });
    }
}

export const getSubscriptionIds = async (req, res) => {
    try {
        const user = await db.collection('users').where('email', '==', req.user.email).get();

        if (user.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        let mySubscriptionIds = await user.docs[0].ref.collection('mySubscriptionIds').get();
        mySubscriptionIds = mySubscriptionIds.docs.map(doc => doc.id);
        res.json(mySubscriptionIds);
    } catch (error) {
        console.log('Get subscription ids error:', error);
        res.status(500).json({ message: 'Failed to get subscription ids', error });
    }
}

export const getSubscriptions = async (req, res) => {
    try {

        const { isGoogleSignin } = req.user;

        if (!isGoogleSignin) {
            const user = await db.collection('users').where('email', '==', req.user.email).get();

            if (user.empty) {
                return res.status(400).json({ message: 'User not found' });
            }

            let mySubscriptionIds = await user.docs[0].ref.collection('mySubscriptionIds').get();
            mySubscriptionIds = mySubscriptionIds.docs.map(doc => doc.id);
            const subscriptionIds = [...mySubscriptionIds].join(',');

            const data = await youtubeService({
                paramOptions: {
                    id: subscriptionIds,
                    part: 'snippet',
                    maxResults: 20,
                },
                path: 'channels'
            });

            res.json(data?.items || []);
        }

        else {
            const youtube = getYoutubeClient(req.cookies.googleAccessToken);
            const { data } = await youtube.subscriptions.list({
                part: 'snippet, statistics',
                maxResults: 20,
                mine: true
            });

            res.json(data.items);
        }

    } catch (error) {
        console.log('Get subscriptions error:', error);
        res.status(500).json({ message: 'Failed to fetch subscriptions', error });
    }
}

export const getChannelById = async (req, res) => {
    const { channelId } = req.params;

    try {
        const data = await youtubeService({
            paramOptions: {
                id: channelId,
                part: 'snippet, statistics, brandingSettings',
            },
            path: 'channels'
        });

        if (!data.items) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        if (data.items?.length === 0) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        const finalData = {
            ...data.items[0],
            brandingSettings: {
                image: {
                    bannerExternalUrl: data.items[0]?.brandingSettings?.image?.bannerExternalUrl
                        + "=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj"
                }
            }
        }

        res.json(finalData);
    } catch (error) {
        console.log('Get channel by id error:', error);
        res.status(500).json({ message: 'Failed to fetch channel', error });
    }
}

export const getChannelsByIds = async (req, res) => {
    let { channelIds } = req.params;

    try {
        const data = await youtubeService({
            paramOptions: {
                id: channelIds,
                part: 'snippet',
            },
            path: 'channels'
        });

        res.json(data.items);
    } catch (error) {
        console.log('Get channels by ids error:', error);
        res.status(500).json({ message: 'Failed to fetch channels', error });
    }
}

export const getFeaturedChannelVideos = async (req, res) => {
    const { channelId } = req.params;

    try {
        const data = await youtubeService({
            paramOptions: {
                channelId,
                part: 'contentDetails',
            },
            path: 'channelSections'
        });

        const filteredData = data.items.filter(item => item?.contentDetails?.playlists?.length > 0);

        if (filteredData.length === 0) {
            return res.status(404).json({ message: 'No playlist found' });
        }

        // DISPLAY THE FIRST PLAYLIST
        const playlistId = filteredData[0]?.contentDetails?.playlists[0];

        const videos = await youtubeService({
            paramOptions: {
                playlistId,
                part: 'snippet,status',
                maxResults: 10,
            },
            path: 'playlistItems'
        });

        res.json(videos.items);
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`Playlist not found or inaccessible: ${playlistId}`);

            return res.status(404).json({
                message: 'Playlist exists but is not accessible (private or deleted)',
                playlistId
            });
        }

        console.log('Get feature channel videos error:', error);
        res.status(500).json({ message: 'Failed to fetch feature channel videos', error });
    }
}

export const getVideosfromChannel = async (req, res) => {
    const { channelId } = req.params;
    const { pageToken } = req.query;

    try {
        const data = await youtubeService({
            paramOptions: {
                id: channelId,
                part: 'contentDetails',
            },
            path: 'channels'
        })

        const uploadId = data.items[0]?.contentDetails?.relatedPlaylists?.uploads;

        const params = {
            playlistId: uploadId,
            maxResults: 20,
            part: 'snippet',
        }

        if (pageToken) {
            params.pageToken = pageToken;
        }

        const videos = await youtubeService({
            paramOptions: params,
            path: 'playlistItems'
        });

        res.json(videos);
    } catch (error) {
        console.log('Get videos from channel error:', error);
        res.status(500).json({ message: 'Failed to fetch videos from channel', error });
    }
}

export const getReportReasons = async (req, res) => {
    try {
        const reportReasonsSnapshot = await db.collection('report_reasons').get();

        if (reportReasonsSnapshot.empty) {
            return res.status(400).json({ message: 'Report reasons not found' });
        }

        const reportReasons = reportReasonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(reportReasons);
    } catch (error) {
        console.log('Get report reasons error:', error);
        res.status(500).json({ message: 'Failed to fetch report reasons', error });
    }
}

export const getReportedVideos = async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').where('email', '==', req.user.email).get();

        if (usersSnapshot.empty) {
            return res.status(400).json({ message: 'Reported videos not found' });
        }

        const reportedVideosSnapshot = await usersSnapshot.docs[0].ref.collection('reportedVideos').get();

        const reportedVideos = reportedVideosSnapshot.docs.map(doc => doc.data());

        console.log(reportedVideos)

        const sortedReportedVideos = reportedVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log(sortedReportedVideos)

        res.json(sortedReportedVideos);
    } catch (error) {
        console.log('Get reported videos error:', error);
        res.status(500).json({ message: 'Failed to fetch reported videos', error });
    }
}

export const reportVideo = async (req, res) => {
    const { videoId } = req.params;
    const { reasonId } = req.body;
    const { email } = req.user;

    try {
        if (!videoId || !reasonId) {
            return res.status(400).json({ message: 'Missing videoId or reasonId' });
        }

        const data = await youtubeService({
            paramOptions: {
                part: 'snippet',
                id: videoId
            },
            path: 'videos'
        })

        const { title: videoTitle, channelTitle } = data.items[0].snippet;

        const reportReason = await db.collection('report_reasons').doc(reasonId).get();

        if (!reportReason.exists) {
            return res.status(400).json({ message: 'Report reason not found' });
        }

        const { label: reasonTitle } = reportReason.data();

        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];

        const reportedVideoData = {
            videoId,
            videoTitle,
            channelTitle,
            reasonId,
            reasonTitle,
            status: 'live',
            type: 'video',
            createdAt: new Date().toISOString(),
        };


        await userDoc.ref.collection('reportedVideos').doc(videoId).set(reportedVideoData);

        const { name } = userDoc.data().channel;

        await transporter.sendMail({
            from: MY_EMAIL,
            to: email,
            subject: 'Cảm ơn bạn đã gửi báo cáo cho YouTube',
            html: `
                <p>Chào ${name || email}!</p>
                <p>Cảm ơn bạn đã báo cáo 
                    <a style="cursor: pointer; color: blue; text-decoration: none" href='${CLIENT_URL}/watch/${videoId}'>
                        video
                    </a> 
                vào ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}. Chúng tôi sẽ xem xét kỹ nội dung này.</p>
                
                <h3>Các bước tiếp theo</h3>
                <p>Sau khi xem xét, chúng tôi có thể:</p>
                <ul>
                    <li>
                    Gỡ bỏ nội dung, nếu nội dung đó vi phạm <a style="cursor: pointer; color: blue; text-decoration: none" href="https://www.youtube.com/howyoutubeworks/our-policies/">Nguyên tắc cộng đồng</a> của chúng tôi</li>
                    <li>Áp dụng các quy định hạn chế, nếu nội dung đó không phù hợp với một số khán giả</li>
                    <li>Cho phép nội dung tiếp tục xuất hiện, nếu nội dung đó không vi phạm Nguyên tắc cộng đồng</li>
                </ul>
                <a href=${REPORT_HISTORY_URL} style="text-decoration: none; cursor: pointer">
                    <button style="padding: 10px 16px; background-color: blue; border: none; color: white; font-weight: bold">KIỂM TRA TRẠNG THÁI CỦA BÁO CÁO</button>
                </a>
            `})

        res.json({ message: 'Video reported successfully' });
    }
    catch {
        console.log('Report video error:', error);
        res.status(500).json({ message: 'Failed to report video', error });
    }
}

export const getMyPosts = async (req, res) => {
    const { email } = req.user;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];

        const myPosts = await userDoc.ref.collection('myPosts').get();

        const myPostsData = myPosts.docs.map((doc) => doc.data());

        const sortedData = myPostsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(sortedData);
    }
    catch {
        console.log('Get my posts error:', error);
        res.status(500).json({ message: 'Failed to get my posts', error });
    }
}

export const createPost = async (req, res) => {
    const { email } = req.user;
    const { id, text, images, quiz, type } = req.body;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];

        const postData = {
            id,
            type,
            createdAt: new Date().toISOString(),
        };

        if (type === 'text' && text) {
            postData.text = text;
        }

        let cloudinaryResponse = null;

        if (type === 'image' && images) {
            cloudinaryResponse = await uploadImages(images);
            postData.images = cloudinaryResponse.map(image => image.secure_url);

            if (text) {
                postData.text = text;
            }
        }

        if (type === 'quiz' && quiz && text) {
            postData.text = text;
            postData.quiz = quiz;
        }

        const postRef = await userDoc.ref.collection('myPosts').doc(id).set(postData);

        res.json({ message: 'Post created successfully' });
    }
    catch (error) {
        console.log('Create post error:', error);
        res.status(500).json({ message: 'Failed to create post', error });
    }
}

export const editPost = async (req, res) => {
    const { postId } = req.params;
    const { text } = req.body;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', req.user.email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];

        const postSnapshot = await userDoc.ref.collection('myPosts').doc(postId).get();

        if (!postSnapshot.exists) {
            return res.status(400).json({ message: 'Post not found' });
        }

        const postData = postSnapshot.data();

        postData.text = text;

        await userDoc.ref.collection('myPosts').doc(postId).set(postData, { merge: true });

        res.json({ message: 'Post edited successfully' });
    } catch (error) {
        console.log('Edit post error:', error);
        res.status(500).json({ message: 'Failed to edit post', error });
    }
}

export const deletePost = async (req, res) => {
    const { postId } = req.params;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', req.user.email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];

        const postDoc = userDoc.ref.collection('myPosts').doc(postId);

        const postSnapshot = await postDoc.get();

        if (!postSnapshot.exists) {
            return res.status(400).json({ message: 'Post not found' });
        }

        if (postSnapshot.data().images) {
            postSnapshot.data().images.forEach(async (image) => {
                const publicId = image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`youtube_images_posts/${publicId}`);
            });
        }

        await postDoc.delete();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.log('Delete post error:', error);
        res.status(500).json({ message: 'Failed to delete post', error });
    }
}

const deleteChannelProfileImage = async (imageUrl) => {
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`youtube_channel_profile_images/${publicId}`);
}

const uploadChannelProfileImage = async (imageUrl) => {
    const cloudinaryResponse = await cloudinary.uploader.upload(imageUrl, { folder: 'youtube_channel_profile_images' });
    return cloudinaryResponse.secure_url;
}

export const editChannelProfile = async (req, res) => {
    let { name, displayName, description, profileUrl, bannerUrl } = req.body;

    try {
        const userSnapshot = await db.collection('users').where('email', '==', req.user.email).get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'User not found' });
        }

        const userDoc = userSnapshot.docs[0];
        const userChannelData = userDoc.data().channel;

        const newData = {
            name,
            displayName,
            description,
        }

        if (!profileUrl) {
            if (userChannelData.profileUrl) {
                await deleteChannelProfileImage(userChannelData.profileUrl)
            }
            newData.profileUrl = ''
        }

        if (profileUrl && userChannelData.profileUrl !== profileUrl) {
            if (userChannelData.profileUrl) {
                await deleteChannelProfileImage(userChannelData.profileUrl)
            }

            newData.profileUrl = await uploadChannelProfileImage(profileUrl)
        }

        if (!bannerUrl) {
            if (userChannelData.bannerUrl) {
                await deleteChannelProfileImage(userChannelData.bannerUrl)
            }
            newData.bannerUrl = ''
        }

        if (bannerUrl && userChannelData.bannerUrl !== bannerUrl) {
            if (userChannelData.bannerUrl) {
                await deleteChannelProfileImage(userChannelData.bannerUrl)
            }

            newData.bannerUrl = await uploadChannelProfileImage(bannerUrl)
        }

        await userDoc.ref.update({
            channel: {
                ...userDoc.data().channel,
                ...newData
            }
        })

        res.json({ message: 'Channel profile edited successfully' });
    } catch (error) {
        console.log('Edit channel profile error:', error);
        res.status(500).json({ message: 'Failed to edit channel profile', error });
    }
}