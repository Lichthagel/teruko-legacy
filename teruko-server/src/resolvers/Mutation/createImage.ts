import { Context } from "../../context.js";
import { FileUpload } from "graphql-upload";
import { finished } from "stream/promises";
import fs from "fs";
import { fileTypeStream } from "file-type";
import sizeOf from "image-size";
import { fetchPixiv, toModel } from "./fetchPixiv.js";

async function createImage(parent: void, { files }: { files: FileUpload[] }, context: Context) {
    return Promise.all(files.map(async (file: FileUpload) => {

        // eslint-disable-next-line @typescript-eslint/await-thenable
        const { createReadStream, filename } = await file;

        const stream = createReadStream();

        const streamWithFileType = await fileTypeStream(stream);

        if (!streamWithFileType.fileType || !streamWithFileType.fileType.mime.match(/^image\/(jpeg|gif|png)$/)) {
            throw new Error("not an image");
        }

        const out = fs.createWriteStream(`./data/${filename}`);

        streamWithFileType.pipe(out);

        await finished(out);

        const dims = sizeOf(`./data/${filename}`);

        if (!dims.width || !dims.height) throw new Error("cant read image dimensions");

        // PIXIV stuff
        const matches = filename.match(/([0-9]+)_p[0-9]+\.(?:jpg|png)/);
        if (matches) {
            const pixivId = matches[1];

            const newImage = await context.prisma.image.create({
                data: {
                    ...toModel(await fetchPixiv(pixivId)),
                    filename,
                    width: dims.width,
                    height: dims.height
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
                width: dims.width,
                height: dims.height
            }
        });

        // returnImages.push(newImage);
        return newImage;
    }));

    // return returnImages;
}

export default createImage;