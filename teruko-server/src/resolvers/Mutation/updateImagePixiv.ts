import { Context } from "../../context.js";
import { fetchPixiv, toModel } from "./fetchPixiv.js";

async function updateImagePixiv(parent: void, { id, source }: { id: string; source?: string }, context: Context) {

    if (!source) {
        const image = await context.prisma.image.findUnique({
            where: {
                id
            }
        });

        if (!image) throw new Error("id not found");

        if (!image.source) throw new Error("could not acquire source url");

        source = image.source;
    }

    const matches = source.match(/https?:\/\/www.pixiv.net(?:\/en)?\/artworks\/(\d+)/);

    if (!matches) throw new Error("not a valid pixiv url");

    const pixivId = matches[1];

    const updatedImage = await context.prisma.image.update({
        where: {
            id: id
        },
        data: {
            ...toModel(await fetchPixiv(pixivId), pixivId),
            updatedAt: new Date()
        }
    });

    return updatedImage;
}

export default updateImagePixiv;