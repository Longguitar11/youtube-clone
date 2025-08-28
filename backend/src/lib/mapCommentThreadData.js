export const mapCommentThreadData = (commentThread, channel, totalReplyCount = 0) => {
    const { id, text, videoId, channelId, likeCount, publishedAt } = commentThread;

    return {
        id,
        snippet: {
            topLevelComment: {
                kind: 'youtube#comment',
                id,
                snippet: {
                    channelId,
                    videoId,
                    textOriginal: text,
                    likeCount,
                    publishedAt,
                    authorDisplayName: channel.displayName,
                    authorProfileImageUrl: channel.profileUrl,
                    authorChannelUrl: channel.channelUrl,
                    authorChannelId: { value: channel.channelId },
                }
            },
            totalReplyCount
        }
    }
}

export const mapCommentData = (comment, channel) => {
    const { id, text, parentId, videoId, channelId, likeCount, publishedAt } = comment;
    return {
        kind: 'youtube#comment',
        id,
        snippet: {
            channelId,
            videoId,
            parentId,
            textOriginal: text,
            likeCount,
            publishedAt,
            authorDisplayName: channel.displayName,
            authorProfileImageUrl: channel.profileUrl,
            authorChannelUrl: channel.channelUrl,
            authorChannelId: { value: channel.channelId },
        }
    }
} 