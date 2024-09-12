import { Context } from "../context.js";
import ImageModel from "../models/Image.js";

function tags(parent: ImageModel, args: void, context: Context) {
  return context.prisma.tag.findMany({
    where: {
      ImageToTag: {
        some: {
          imageId: parent.id,
        },
      },
    },
    orderBy: [
      {
        category: {
          slug: "asc",
        },
      },
      {
        slug: "asc",
      },
    ],
  });
}

const Image = {
  tags,
};

export default Image;
