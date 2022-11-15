import { Context } from "../../context.js";
import { fetchPixiv, toModel as toPixivModel } from "./fetchPixiv.js";
import { fetchArtStation, toModel as toArtStationModel } from "./fetchArtStation.js";
import fetch from "node-fetch";
import fs from "fs";
import { finished } from "stream/promises";
import path from "path";
import sharp from "sharp";
import { fileTypeStream } from "file-type";

const inUpload: string[] = [];

async function createImageFromUrl(parent:void, { url }: { url: string }, context: Context) {
    let matches = url.match(/https?:\/\/www\.pixiv\.net(?:\/en)?\/artworks\/([0-9]+)/);

    if (matches) {
        const pixivId = matches[1];

        return createImageFromPixiv(parent, pixivId, context);
    }

    matches = url.match(/https?:\/\/www\.artstation\.com\/artwork\/([0-9a-zA-Z]+)/);

    if (!matches) throw new Error("not a valid url");

    const artStationId = matches[1];

    return await createImageFromArtStation(parent, artStationId, context);
}

async function createImageFromPixiv(parent: void, pixivId: string, context: Context) {
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

        const out = fs.createWriteStream(path.resolve(context.imgFolder, filename));

        streamWithFileType.pipe(transform).pipe(out);

        await finished(out);
        out.close();

        const metadata = await sharp(path.resolve(context.imgFolder, filename))
            .metadata();

        if (!metadata.width || !metadata.height) throw new Error("cant read image dimensions");

        inUpload.splice(inUpload.findIndex(val => val === filename), 1);

        resultPromises.push(context.prisma.image.create({
            data: {
                ...toPixivModel(pixivResult, matchesUrl[2]),
                filename,
                height: metadata.height,
                width: metadata.width
            }
        }));
    }

    return Promise.all(resultPromises);
}

async function createImageFromArtStation(parent:void, artStationId: string, context: Context) {
    const asResult = await fetchArtStation(artStationId);

    const resultPromises = [];

    for (let i = 0; i < asResult.assets.length; i++) {
        const asset = asResult.assets[i];

        if (asset.asset_type !== "image") continue;

        const res = await fetch(asset.image_url);

        const streamWithFileType = await fileTypeStream(res.body);

        if (!streamWithFileType.fileType || !streamWithFileType.fileType.mime.match(/^image\/(jpeg|gif|png|webp|avif|gif)$/)) {
            resultPromises.push(Promise.reject(new Error("not an image")));
            continue;
        }

        if (streamWithFileType.fileType.mime === "image/gif") continue;

        const filename = `${asset.id}.avif`;

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

        const out = fs.createWriteStream(path.resolve(context.imgFolder, filename));

        streamWithFileType.pipe(transform).pipe(out);

        await finished(out);
        out.close();

        const metadata = await sharp(path.resolve(context.imgFolder, filename))
            .metadata();

        if (!metadata.width || !metadata.height) throw new Error("cant read image dimensions");

        inUpload.splice(inUpload.findIndex(val => val === filename), 1);

        const image = context.prisma.image.create({
            data: {
                ...toArtStationModel(asResult),
                filename,
                height: metadata.height,
                width: metadata.width
            }
        });

        resultPromises.push(image);
    }

    return await Promise.all(resultPromises);
}

export default createImageFromUrl;