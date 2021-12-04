import { Context } from "../../context.js";
import { fetchPixiv, toModel } from "./fetchPixiv.js";
import fetch from "node-fetch";
import fs from "fs";
import { finished } from "stream/promises";
import sizeOf from "image-size";

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

        const filename = `${matchesUrl[2]}_p${i}.${matchesUrl[3]}`;

        const out = fs.createWriteStream(`./data/${filename}`);

        res.body.pipe(out);

        await finished(out);

        const dims = sizeOf(`./data/${filename}`);

        if (!dims.width || !dims.height) throw new Error("cant read image dimensions");

        resultPromises.push(context.prisma.image.create({
            data: {
                ...toModel(pixivResult),
                filename,
                height: dims.height,
                width: dims.width
            }
        }));
    }

    return Promise.all(resultPromises);
}

export default createImageFromPixiv;