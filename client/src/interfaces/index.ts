export interface IChildren {
    children: React.ReactNode;
}
export interface IUser {
    _id: string;
    username: string;
    fullname: string;
    avatar?: string;
    coverImage?: string;
    email?: string;
    watchHistory?: Array<IVideoData>;
    watchLater?: Array<IVideoData>;
}
export interface IRegisterForm {
    fullname: string;
    email: string;
    password: string;
    username: string;
}
export interface ILoginForm {
    email: string;
    password: string;
}
export interface IUiData {
    isShareModalOpen: boolean;
    shareData: {
        id: string;
        type: string;
    };
    isMenuOpen: boolean;
    isVideoModalOpen: boolean;
    isLoginPopoverVisible: boolean;
    loginPopoverMessage: string;
}
export interface IAction {
    type: string;
    payload: any;
}
export interface IVideoUploadForm {
    title: string;
    description: string;
    video: File;
    thumbnail: File;
}
export interface IVideoData {
    _id: string;
    title: string;
    thumbnailPreviews:string;
    description?: string;
    source?: string;
    subtitle?: string;
    thumbnail: string;
    creator: IUser;
    views: number;
    duration: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IShortData {
    _id: string;
    title: string;
    thumbnailPreviews:string;
    description?: string;
    source?: string;
    subtitle?: string;
    thumbnail: string;
    creator: IUser;
    views: number;
    createdAt?: Date;
    updatedAt?: Date;
    next:string;
    prev:string;
}
export interface IComment {
    _id: string;
    content: string;
    sentiment: string;
    creator: IUser;
    createdAt?: Date;
    repliesCount: number;
}
export interface IReply {
    _id: string;
    content: string;
    sentiment: string;
    creator: IUser;
    createdAt?: Date;
}
export interface ApiResponse {
    success: boolean;
    message: string;
    status: number;
    data: any;
}
export interface IPlaylist {
    _id: string;
    name: string;
    description: string;
    videos: Array<IVideoData>;
    shorts: Array<IShortData>;
    creator: IUser;
    createdAt: Date;
    updatedAt: Date;
}
export interface PartETag {
    PartNumber: number;
    ETag: string;
}
export interface INotification {
    _id: string;
    video?: {
        _id: string;
        thumbnail: string;
    };
    short?: {
        _id: string;
        thumbnail: string;
    };
    creator: {
        _id: string;
        fullname: string;
        avatar: string;
    };
    tweet?: {
        _id: string;
        image: string;
    };
    message: string;
    read: boolean;
    createdAt: Date;
}

export interface IPostData {
    _id: string;
    content: string;
    image: string;
    creator: IUser;
    createdAt: Date;
    updatedAt: Date;
}

