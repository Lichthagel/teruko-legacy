import { Context } from "../../context.js";

export type TagCategoryUpdateArgs = {
  slug: string;
  newSlug?: string;
  color?: string;
};

async function updateTagCategory(parent: void, args: TagCategoryUpdateArgs, context: Context) {
  const updatedCategory = await context.prisma.tagCategory.update({
    where: {
      slug: args.slug,
    },
    data: {
      slug: args.newSlug,
      color: args.color,
    },
  });

  return updatedCategory;
}

export default updateTagCategory;
