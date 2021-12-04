import { Context } from "../../context.js";


async function deleteTag(parent: void, args: { slug: string }, context: Context) {
    const deletedTag = await context.prisma.tag.delete({
        where: {
            slug: args.slug
        }
    });

    return deletedTag;
}

export default deleteTag;