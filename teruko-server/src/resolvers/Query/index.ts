import { Tag } from "@prisma/client";

import { Context } from "../../context.js";
import image from "./image.js";
import images from "./images.js";
import random from "./random.js";

async function imageCount(parent: void, args: void, context: Context) {
  return context.prisma.image.count();
}

async function tag(parent: void, { slug }: { slug: string }, context: Context) {
  return context.prisma.tag.findUnique({
    where: {
      slug,
    },
  });
}

async function tagSuggestions(parent: void, args: { filter: string }, context: Context) {
  return context.prisma.$queryRaw<Tag[]>`SELECT * FROM "Tag" WHERE LOWER("Tag"."slug") LIKE LOWER(${`%${args.filter}%`}) ESCAPE '\\' ORDER BY LENGTH("Tag"."slug") LIMIT 10`;
}

async function tagCategories(parent: void, args: void, context: Context) {
  return context.prisma.tagCategory.findMany({});
}

function config() {
  return {};
}

const Query = {
  image,
  images,
  random,
  imageCount,
  tag,
  tagSuggestions,
  tagCategories,
  config,
};

export default Query;
