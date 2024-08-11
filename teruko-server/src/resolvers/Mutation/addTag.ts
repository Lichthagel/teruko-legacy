import { Context } from "../../context.js";


export type TagMutationArgs = {
    imageId: string;
    tag: string;
}

async function addTag(parent: void, args: TagMutationArgs, context: Context) {

    const updatedImage = await context.prisma.image.update({
        where: {
            id: args.imageId
        },
        data: {
            updatedAt: new Date(),
            tags: {
                connectOrCreate: [
                    {
                        where: {
                            slug: args.tag
                        },
                        create: {
                            slug: args.tag
                        }
                    }
                ]
            }
        }
    });

    return updatedImage;
}

export default addTag;