import { Context } from "../../context.js";
import { TagMutationArgs } from "./addTag.js";

async function removeTag(parent: void, args: TagMutationArgs, context: Context) {
  // TODO check if possible to use delete instead of deleteMany
  await context.prisma.imageToTag.deleteMany({
    where: {
      imageId: args.imageId,
      Tag: {
        slug: args.tag,
      },
    },
  });

  await context.prisma.$executeRaw`
    DELETE FROM "Tag"
    WHERE "Tag"."slug" NOT IN (
        SELECT DISTINCT "Tag"."slug"
        FROM "_ImageToTag"
        LEFT JOIN "Tag" ON "_ImageToTag"."tagId" = "Tag"."id"
        WHERE "Tag"."slug" = ${args.tag}
    )
    AND "Tag"."slug" = ${args.tag};
  `;

  // TODO check if return is needed
  return context.prisma.image.findUnique({
    where: {
      id: args.imageId,
    },
  });
}

export default removeTag;
