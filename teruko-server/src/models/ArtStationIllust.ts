export type ArtStationAsset = {
    has_image: boolean;
    has_embedded_player: boolean;
    player_embedded?: unknown;
    oembed?: unknown;
    id: number;
    title: string;
    title_formatted: string;
    image_url?: string;
    width?: number;
    height?: number;
    position: number;
    asset_type: "image" | "video";
    viewport_constraint_type: "constrained" | unknown;
    [key: string]: unknown;
}

type ArtStationUser = {
    id: number;
    username: string;
    headline: string;
    full_name: string;
    permalink: string;
    medium_avatar_url?: string;
    large_avatar_url?: string;
    small_cover_url?: string;
    pro_member: boolean;
    [key: string]: unknown;
}

type ArtStationMedium = {
    name: string;
    id: number;
}

type ArtStationCategory = {
    name: string;
    id: number;
}

type ArtStationSoftware = {
    name: string;
    icon_url: string;
}

type ArtStationIllust = {
    liked: boolean;
    tags: string[];
    hide_as_adult: boolean;
    visible_on_artstation: boolean;
    assets: ArtStationAsset[];
    user: ArtStationUser;
    medium: ArtStationMedium;
    mediums: ArtStationMedium[];
    categories: ArtStationCategory[];
    software_items: ArtStationSoftware[];
    id: number;
    user_id: number;
    title: string;
    description: string;
    description_html: string;
    created_at: string;
    updated_at: string;
    views_count: number;
    likes_count: number;
    comments_count: number;
    permalink: string;
    cover_url: string;
    published_at: string;
    editor_pick: boolean;
    adult_content: boolean;
    admin_adult_content: boolean;
    slug: string;
    suppressed: false;
    hash_id: string;
    visible: boolean;
    [key: string]: unknown;
}

export default ArtStationIllust;