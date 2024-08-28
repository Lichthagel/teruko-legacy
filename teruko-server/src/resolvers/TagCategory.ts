import { Context } from "../context.js";
import TagCategoryModel from "../models/TagCategory.js";

async function tags(parent: TagCategoryModel, args: void, context: Context) {
  return context.prisma.tagCategory.findUnique({ where: { slug: parent.slug } }).tags();
}

const TagCategory = {
  tags,
};

export default TagCategory;
