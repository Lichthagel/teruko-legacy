interface PixivTranslation {
    en?: string;
}

interface PixivTag {
    tag: string;
    locked: boolean;
    deletable: boolean;
    userId?: string;
    romaji?: string;
    translation?: PixivTranslation;
    userName?: string;
}

interface PixivIllust {
    illustId: string;
    illustTitle?: string;
    illustComment?: string;
    id: string;
    title?: string;
    description?: string;
    illustType: number;
    createDate: string;
    uploadDate: string;
    restrict: number;
    xRestrict: number;
    sl: number;
    urls: {
        mini?: string;
        thumb?: string;
        small?: string;
        regular?: string;
        original: string;
    };
    tags: {
        authorId: string;
        isLocked: boolean;
        tags: PixivTag[];
        writable: boolean;
    };
    alt: string;
    storableTags: string[];
    userId: string;
    userName: string;
    userAccount: string;
    userIllusts: Record<string, null>;
    likeData: boolean;
    width: number;
    height: number;
    pageCount: number;
    bookmarkCount: number;
    likeCount: number;
    commentCount: number;
    responseCount: number;
    viewCount: number;
    bookStyle: number;
    isHowto: boolean;
    isOriginal: boolean;
    aiType: number;
    [key: string]: unknown;
}

interface PixivIllustResult {
    error: boolean;
    message: string;
    body?: PixivIllust;
}

export default PixivIllustResult;
