export interface IChildren {
    children: React.ReactNode;
}
export interface IUser {
    _id: string;
    username: string;
    fullname: string;
    avatar?: string;
    coverImage?: string;
    email: string;
    watchHistory?: [];
    isSubscribed?: boolean;
    subscriberCount?: number;
    subscribedToCount?: number;
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
export interface IAuthData {
    status: boolean;
    userData: IUser | null;
}
export interface IUiData {
    isMenuOpen: boolean;
    isVideoModalOpen: boolean;
}
export interface IAction {
    type: string;
    payload: any;
}
export interface IVideoForm {
    title: string;
    description: string;
    video: FileList;
    thumbnail: FileList;
}
export interface IVideoData {
    _id: string;
    title: string;
    description: string;
    video: string;
    thumbnail: string;
    creator: IUser;
    views: number;
    duration: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IComment {
    _id: string;
    content: string;
    sentiment: string;
    creator: IUser;
    createdAt: Date;
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
    videos: IVideoData[];
    creator: IUser;
    createdAt: Date;
    updatedAt: Date;
}