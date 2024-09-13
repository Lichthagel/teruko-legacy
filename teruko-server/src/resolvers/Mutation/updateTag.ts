import { Context } from "../../context.js";

export type TagUpdateArgs = {
  slug: string;
  newSlug?: string;
  category?: string;
};

async function updateTag(parent: void, args: TagUpdateArgs, context: Context) {
  const rename: boolean = !!args.newSlug && args.newSlug !== args.slug;
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

  if (rename) {
    return await context.prisma.$transaction(async (tx) => {
    // check if exists
      const tagExist = await tx.tag.findUnique({
        where: {
          slug: args.newSlug,
        },
      });

      if (tagExist) {
        await tx.$executeRaw`
          INSERT INTO "_ImageToTag" as "t0" ("imageId", "tagId")
          SELECT t1."imageId", ${tagExist.id}
          FROM "_ImageToTag" as t1
          LEFT JOIN "Tag" as t2 ON t1."tagId" = t2."id"
          WHERE t2."slug" = ${args.slug}
          ON CONFLICT DO NOTHING;
        `;

        await tx.imageToTag.deleteMany({
          where: {
            Tag: {
              slug: args.slug,
            },
          },
        });

        await tx.tag.delete({
          where: {
            slug: args.slug,
          },
        });

        return await tx.tag.update({
          where: {
            slug: args.newSlug,
          },
          data: {
            category,
          },
          select: {
            id: true,
            slug: true,
            category: true,
          },
        });
      } else {
        const tag = await tx.tag.update({
          where: {
            slug: args.slug,
          },
          data: {
            slug: args.newSlug,
            category,
          },
          select: {
            id: true,
            slug: true,
            category: true,
          },
        });

        return tag;
      }
    });
  } else {
    const tag = await context.prisma.tag.update({
      where: {
        slug: args.slug,
      },
      data: {
        category,
      },
      select: {
        id: true,
        slug: true,
        category: true,
      },
    });

    return tag;
  }
}

export default updateTag;
