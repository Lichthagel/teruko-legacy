import { Context } from "../../context.js";
import { fetchPixiv, toModel } from "./fetchPixiv.js";
import fetch from "node-fetch";
import fs from "fs";
import { finished } from "stream/promises";
import path from "path";
import sharp from "sharp";
import { fileTypeStream } from "file-type";

const inUpload: string[] = [];

async function createImageFromPixiv(parent: void, { url }: { url: string }, context: Context) {
    const matches = url.match(/https?:\/\/www.pixiv.net(?:\/en)?\/artworks\/([0-9]+)/);

    if (!matches) throw new Error("not a valid pixiv url");

    const pixivId = matches[1];

    const pixivResult = await fetchPixiv(pixivId);

    if (pixivResult.error || !pixivResult.body) throw new Error("failed to retrieve pixiv metadata");

    const imgUrl = pixivResult.body.urls.original;

    if (!imgUrl) throw new Error("couldnt retrieve image url");

    const matchesUrl = imgUrl.match(/(.*\/)([0-9]+)_p[0-9]+\.(.*)/);

    if (!matchesUrl) throw new Error("invalid pixiv url");

    const resultPromises = [];

    for (let i = 0; i < pixivResult.body.pageCount; i++) {
        const res = await fetch(`${matchesUrl[1] + matchesUrl[2]}_p${i}.${matchesUrl[3]}`, {
            headers: {
                Referer: "https://www.pixiv.net/"
            },
            compress: true
        });

        const streamWithFileType = await fileTypeStream(res.body);

        if (!streamWithFileType.fileType || !streamWithFileType.fileType.mime.match(/^image\/(jpeg|gif|png|webp|avif)$/)) {
            resultPromises.push(Promise.reject(new Error("not an image")));
            continue;
        }

        const filename = `${matchesUrl[2]}_p${i}.avif`;

        if (await context.prisma.image.findUnique({
            where: {
                filename
            }
        })) {
            resultPromises.push(Promise.reject(new Error("already exists")));
            continue;
        }

        if (inUpload.findIndex((val) => val === filename) >= 0) {
            resultPromises.push(Promise.reject(new Error("already uploading")));
            continue;
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

        inUpload.splice(inUpload.findIndex(val => val === filename), 1);

        resultPromises.push(context.prisma.image.create({
            data: {
                ...toModel(pixivResult, matchesUrl[2]),
                filename,
                height: metadata.height,
                width: metadata.width
            }
        }));
    }

    return Promise.all(resultPromises);
}

export default createImageFromPixiv;