import { Context } from "../../context.js";

export type TagUpdateArgs = {
  slug: string;
  newSlug?: string;
  category?: string;
};

async function updateTag(parent: void, args: TagUpdateArgs, context: Context) {
  if (args.newSlug) {
    await context.prisma.$queryRaw`
INSERT INTO "_ImageToTag" as "t0" ("imageId", "tagSlug")
SELECT t1."imageId", ${args.slug}
FROM "_ImageToTag" as t1
WHERE t1."tagSlug" = ${args.newSlug}
AND t1."imageId" NOT IN (
    SELECT t2."imageId"
    FROM "_ImageToTag" as t2
    WHERE t2."tagSlug" = ${args.slug}
);
        `;

    await context.prisma.tag.deleteMany({
      where: {
        slug: args.newSlug,
      },
    });
  }

  const category = args.category === null ?
      { disconnect: true } :
      (args.category && args.category !== "" ?
          {
            connectOrCreate: {
              where: {
                slug: args.category,
              },
              create: {
                slug: args.category,
              },
            },
          } :
        undefined);

  const updatedTag = await context.prisma.tag.update({
    where: {
      slug: args.slug,
    },
    data: {
      slug: args.newSlug,
      category,
    },
  });

  return updatedTag;
}

export default updateTag;
