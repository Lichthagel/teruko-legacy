import { Context } from "../../context.js";

export type TagMutationArgs = {
  imageId: number;
  tag: string;
};

async function addTag(parent: void, args: TagMutationArgs, context: Context) {
  const updatedImage = await context.prisma.image.update({
    where: {
      id: args.imageId,
    },
    data: {
      updatedAt: new Date(),
      ImageToTag: {
        connectOrCreate: [
          {
            where: {
              imageId_tagSlug: {
                imageId: args.imageId,
                tagSlug: args.tag,
              },
            },
            create: {
              tagSlug: args.tag,
            },
          },
        ],
      },
    },
  });

  return updatedImage;
}

export default addTag;
