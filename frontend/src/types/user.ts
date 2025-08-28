export interface UserInterface {
    email: string
    picture?: string
    name?: string
    googleId?: string
    isGoogleSignin?: boolean
    myLikedVideoIds?: string[]
    myDislikedVideoIds?: string[]
    mySubscriptionIds?: string[]
    channel: {
        channelId: string,
        name: string,
        displayName: string,
        description: string,
        profileUrl: string
        bannerUrl: string
    }
}