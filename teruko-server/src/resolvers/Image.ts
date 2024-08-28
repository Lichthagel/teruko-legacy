import { Context } from "../context.js";
import ImageModel from "../models/Image.js";

async function tags(parent: ImageModel, args: void, context: Context) {
  return context.prisma.image.findUnique({ where: { id: parent.id } }).tags({
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
