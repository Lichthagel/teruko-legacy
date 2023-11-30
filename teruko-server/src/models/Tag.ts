import TagCategory from "./TagCategory.js";

interface Tag {
    slug: string;
    category?: TagCategory;
}

export default Tag;