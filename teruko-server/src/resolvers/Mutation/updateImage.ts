import { Context } from "../../context.js";
import ImageModel from "../../models/Image.js";

async function updateImage(parent: void, args: ImageModel, context: Context) {
  const updatedImage = await context.prisma.image.update({
    where: {
      id: args.id,
    },
    data: {
      title: args.title,
      source: args.source,
      updatedAt: new Date(),
    },
  });

  return updatedImage;
}

export default updateImage;
