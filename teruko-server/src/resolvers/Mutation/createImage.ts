import { Context } from "../../context.js";
import { finished } from "stream/promises";
import fs from "fs";
import { fileTypeStream } from "file-type";
import { fetchPixiv, toModel } from "./fetchPixiv.js";
import path from "path";
import sharp from "sharp";
import { Readable } from "stream";


const inUpload: string[] = [];

async function createImage(parent: void, { files }: { files: File[] }, context: Context) {
    return Promise.all(files.map(async (file: File) => {

        // eslint-disable-next-line @typescript-eslint/await-thenable
        const filename = file.name.replace(/[^./\\]+$/, "avif");

        const streamWithFileType = await fileTypeStream(Readable.from(file.stream()));

        if (!streamWithFileType.fileType || !streamWithFileType.fileType.mime.match(/^image\/(jpeg|gif|png|webp|avif)$/)) {
            throw new Error("not an image");
        }

        if (await context.prisma.image.findUnique({
            where: {
                filename
            }
        }) || inUpload.findIndex((val) => val === filename) >= 0) {
            return Promise.reject(new Error("already exists"));
        }
        inUpload.push(filename);

        const transform = sharp().avif({ quality: 90 });

        const out = fs.createWriteStream(path.join(context.imgFolder, filename));

        streamWithFileType.pipe(transform).pipe(out);

        await finished(out);
        out.close();

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

        inUpload.splice(inUpload.findIndex(val => val === filename), 1);

        return newImage;
    }));
}

export default createImage;