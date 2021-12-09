import { Context } from "../../context.js";
import ImageModel from "../../models/Image.js";
import fs from "fs";
import path from "path";


async function deleteImage(parent: void, args: ImageModel, context: Context) {
    const deletedImage = await context.prisma.image.delete({
        where: {
            id: args.id
        }
    });

    await fs.promises.rm(path.join(context.imgFolder, deletedImage.filename));

    return deletedImage;
}

export default deleteImage;