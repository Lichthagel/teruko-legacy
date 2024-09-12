import { Context } from "../context.js";
import TagModel from "../models/Tag.js";

async function category(parent: TagModel, args: void, context: Context) {
  return context.prisma.tag.findUnique({ where: { slug: parent.slug } }).category();
}

async function images(parent: TagModel, args: void, context: Context) {
  return context.prisma.image.findMany({
    where: {
      ImageToTag: {
        some: {
          tagSlug: parent.slug,
        },
      },
    },
  });
}

async function count(parent: TagModel, args: void, context: Context) {
  const res: { count: bigint }[] = await context.prisma.$queryRaw`SELECT COUNT("tagSlug") FROM "_ImageToTag" WHERE "tagSlug" = ${parent.slug}`;

  if (res.length === 0) {
    throw new Error("Tag not found");
  }

  return Number(res[0].count);
}

const Tag = {
  category,
  images,
  count,
};

export default Tag;
