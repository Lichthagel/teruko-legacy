import { Context } from "../../context.js";
import ImageModel from "../../models/Image.js";
import fs from "fs";
import path from "path";


async function deleteImage(parent: void, args: ImageModel, context: Context) {

    const deletedImageTags = await context.prisma.image.findUnique({ where: { id: args.id } }).tags();

    const deletedImage = await context.prisma.image.delete({
        where: {
            id: args.id
        }
    });

    try {
        for await (const tag of deletedImageTags) {
            await context.prisma.$executeRaw`DELETE FROM "Tag"
        WHERE "Tag"."slug" NOT IN (
            SELECT DISTINCT "_ImageToTag"."B"
            FROM "_ImageToTag"
            WHERE "_ImageToTag"."B" = ${tag.slug}
        )
        AND "Tag"."slug" = ${tag.slug};`;
        }
    } catch (err) {
        console.log(err);
    }

    try {
        await fs.promises.rm(path.join(context.imgFolder, deletedImage.filename));
    } catch (err) {
        console.log(err);
    }

    return deletedImage;
}

export default deleteImage;