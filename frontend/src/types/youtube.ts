export interface ThumbnailInterface {
    url: string,
    width: number,
    height: number
}

export interface YoutubeVideoInterface {
    id: string
    kind: string
    etag: string
    snippet: {
        publishedAt: Date,
        title: string,
        channelId: string,
        description: string,
        thumbnails: {
            default: ThumbnailInterface,
            medium: ThumbnailInterface,
            high: ThumbnailInterface
            standard: ThumbnailInterface
            maxres: ThumbnailInterface
        }
        channelTitle: string
        tags?: string[]
    }
    statistics?: {
        viewCount: number
        likeCount: number
        commentCount: number
    }
    status?: {
        privacyStatus: "private" | "public"
    }
}

export interface ChannelInterface {
    id: string
    kind: string
    etag: string
    snippet: {
        publishedAt: Date,
        title: string,
        customUrl: string,
        channelId: string,
        description: string,
        thumbnails: {
            default: ThumbnailInterface,
            medium: ThumbnailInterface,
            high: ThumbnailInterface,
        },
        country: string
    },
    statistics: {
        viewCount: number,
        subscriberCount: number,
        // hiddenSubscriberCount: false,
        videoCount: number
    },
    brandingSettings: {
        image: {
            bannerExternalUrl: string
        }
    }
}

export interface CommentInterface {
    id: string
    kind: string
    etag: string
    snippet: {
        videoId: string
        authorDisplayName: string
        authorProfileImageUrl: string
        authorChannelUrl: string
        authorChannelId: {
            value: string
        },
        channelId: string
        textDisplay: string
        textOriginal: string
        likeCount: number
        parentId?: string
        publishedAt: Date
        updatedAt: Date
    }
}

export interface CommentThreadInterface {
    id: string
    kind: string
    etag: string
    snippet: {
        videoId: string
        topLevelComment: CommentInterface
        canReply: boolean
        totalReplyCount: number
        isPublic: boolean
    }
    isShowReplies?: boolean
    replies?: {
        comments: CommentInterface[]
    }
}

export interface ReportReasonInterface {
    id: string
    label: string
}

export interface ReportedVideoInterface {
    videoId: string
    videoTitle: string
    channelTitle: string
    reasonId: string
    reasonTitle: string
    createdAt: Date
    status: string
    type: 'video' | 'channel'
}

export interface PostInterface {
    id: string,
    type: PostType
    images?: string[],
    text?: string
    quiz?: QuizInterface[]
    createdAt: Date
}

export interface QuizInterface {
    id: string,
    value: string
    isCorrect: boolean
    explain?: string
}

export type MenuType = 'home' | 'videos' | 'posts'
export type PostType = 'text' | 'image' | 'quiz'

