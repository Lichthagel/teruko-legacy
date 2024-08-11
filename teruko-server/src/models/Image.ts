import Tag from "./Tag.js";

export type Image = {
    id: string;
    filename: string;
    title: string | undefined;
    source: string | undefined;
    createdAt: Date;
    updatedAt: Date;
    tags: Tag[];
}

export enum ImageSort {
    Random = "random",
    Newest = "newest",
    Oldest = "oldest",
    LastUpdated = "last_updated"
}

export default Image;