import { Context } from "../../context.js";
import { TagMutationArgs } from "./addTag.js";

async function removeTag(parent: void, args: TagMutationArgs, context: Context) {
  const updatedImage = await context.prisma.image.update({
    where: {
      id: args.imageId,
    },
    data: {
      updatedAt: new Date(),
      ImageToTag: {
        disconnect: {
          imageId_tagSlug: {
            imageId: args.imageId,
            tagSlug: args.tag,
          },
        },
      },
    },
  });

  /* await context.prisma.tag.deleteMany({
        where: {
            images: {
                none: {}
            }
        }
    }); */
  await context.prisma.$executeRaw`DELETE FROM "Tag"
    WHERE "Tag"."slug" NOT IN (
        SELECT DISTINCT "_ImageToTag"."B"
        FROM "_ImageToTag"
        WHERE "_ImageToTag"."B" = ${args.tag}
    )
    AND "Tag"."slug" = ${args.tag};`;

  return updatedImage;
}

export default removeTag;
