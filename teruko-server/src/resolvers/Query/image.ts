import { Context } from "../../context.js";

async function image(parent: void, args: { id: number }, context: Context) {
  return await context.prisma.image.findUnique({
    where: {
      id: args.id,
    },
  });
}

export default image;
