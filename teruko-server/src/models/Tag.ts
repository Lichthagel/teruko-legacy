import TagCategory from "./TagCategory";

interface Tag {
    slug: string;
    category?: TagCategory;
}

export default Tag;