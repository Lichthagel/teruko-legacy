import { Context } from "../../context.js";
import { FileUpload } from "graphql-upload";
import { finished } from "stream/promises";
import fs from "fs";
import { fileTypeStream } from "file-type";
import { fetchPixiv, toModel } from "./fetchPixiv.js";
import path from "path";
import sharp from "sharp";

async function createImage(parent: void, { files }: { files: FileUpload[] }, context: Context) {
    return Promise.all(files.map(async (file: FileUpload) => {

        // eslint-disable-next-line @typescript-eslint/await-thenable
        const { createReadStream, filename } = await file;

        const stream = createReadStream();

        const streamWithFileType = await fileTypeStream(stream);

        if (!streamWithFileType.fileType || !streamWithFileType.fileType.mime.match(/^image\/(jpeg|gif|png|webp|avif)$/)) {
            throw new Error("not an image");
        }

        const out = fs.createWriteStream(path.join(context.imgFolder, filename));

        streamWithFileType.pipe(out);

        await finished(out);

        const metadata = await sharp(path.join(context.imgFolder, filename))
            .metadata();

        if (!metadata.width || !metadata.height) throw new Error("cant read image dimensions");

        // PIXIV stuff
        const matches = filename.match(/([0-9]+)_p[0-9]+\.(?:jpg|png|gif|jpeg|webp|avif)/);
        if (matches) {
            const pixivId = matches[1];

            const newImage = await context.prisma.image.create({
                data: {
                    ...toModel(await fetchPixiv(pixivId), pixivId),
                    filename,
                    width: metadata.width,
                    height: metadata.height
                }
            });

            // returnImages.push(newImage);
            return newImage;
        }

        const newImage = await context.prisma.image.create({
            data: {
                filename,
                tags: {
                    connectOrCreate: [
                        {
                            where: {
                                slug: "untagged"
                            },
                            create: {
                                slug: "untagged"
                            }
                        }
                    ]
                },
                width: metadata.width,
                height: metadata.height
            }
        });

        // returnImages.push(newImage);
        return newImage;
    }));

    // return returnImages;
}

export default createImage;