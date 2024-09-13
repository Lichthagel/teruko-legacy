import { Context } from "../../context.js";

export type TagMutationArgs = {
  imageId: number;
  tag: string;
};

async function addTag(parent: void, args: TagMutationArgs, context: Context) {
  return await context.prisma.$transaction(async (tx) => {
    const tag = await tx.tag.upsert({
      where: {
        slug: args.tag,
      },
      create: {
        slug: args.tag,
      },
      update: {},
    });

    const updatedImage = await tx.image.update({
      where: {
        id: args.imageId,
      },
      data: {
        updatedAt: new Date(),
        ImageToTag: {
          connectOrCreate: [
            {
              where: {
                imageId_tagId: {
                  imageId: args.imageId,
                  tagId: tag.id,
                },
              },
              create: {
                Tag: {
                  connect: {
                    id: tag.id,
                  },
                },
              },
            },
          ],
        },
      },
    });

    return updatedImage;
  });
}

export default addTag;
