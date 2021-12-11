export interface Image {
    id:number;
    filename: string;
    title?: string;
    source?: string;
    createdAt: string;
    updatedAt: string;
    tags: Tag[];
}

export interface Tag {
    slug: string;
    category?: TagCategory;
}

export interface TagCategory {
    slug: string;
    color?: string;
}