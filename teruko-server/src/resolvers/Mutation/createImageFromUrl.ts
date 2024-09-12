import type { ReadableStream } from "node:stream/web";

import { fileTypeStream } from "file-type";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import sharp from "sharp";

import { Context } from "../../context.js";
import {
  fetchArtStation,
  toModel as toArtStationModel,
} from "./fetchArtStation.js";
import { fetchPixiv, toModel as toPixivModel } from "./fetchPixiv.js";

const inUpload: string[] = [];

async function createImageFromPixiv(
  parent: void,
  pixivId: string,
  context: Context,
) {
  const pixivResult = await fetchPixiv(pixivId);

  if (pixivResult.error || !pixivResult.body) {
    throw new Error("failed to retrieve pixiv metadata");
  }

  const imgUrl = pixivResult.body.urls.original;

  if (!imgUrl) {
    throw new Error("couldnt retrieve image url");
  }

  const matchesUrl = imgUrl.match(/(.*\/)(\d+)_p\d+\.(.*)/);

  if (!matchesUrl) {
    throw new Error("invalid pixiv url");
  }

  const resultPromises = [];

  for (let i = 0; i < pixivResult.body.pageCount; i++) {
    resultPromises.push(
      (async () => {
        const res = await fetch(
          `${matchesUrl[1] + matchesUrl[2]}_p${i}.${matchesUrl[3]}`,
          {
            headers: {
              Referer: "https://www.pixiv.net/",
            },
          },
        );

        if (!res.ok) {
          throw new Error("failed to fetch image");
        }

        if (!res.body) {
          throw new Error("no body in response");
        }

        const streamWithFileType = await fileTypeStream(Readable.fromWeb(res.body as ReadableStream<Uint8Array>));

        if (
          !streamWithFileType.fileType ||
          !/^image\/(jpeg|gif|png|webp|avif)$/.test(
            streamWithFileType.fileType.mime,
          )
        ) {
          throw new Error("not an image");
        }

        const filename = `${matchesUrl[2]}_p${i}.avif`;

        if (
          await context.prisma.image.findUnique({
            where: {
              filename,
            },
          })
        ) {
          throw new Error("already exists");
        }

        if (inUpload.includes(filename)) {
          throw new Error("already uploading");
        }

        inUpload.push(filename);

        const transform = sharp().avif({ quality: 90 });

        const out = fs.createWriteStream(
          path.resolve(context.imgFolder, filename),
        );

        streamWithFileType.pipe(transform).pipe(out);

        await finished(out);
        out.close();

        const metadata = await sharp(
          path.resolve(context.imgFolder, filename),
        ).metadata();

        if (!metadata.width || !metadata.height) {
          throw new Error("cant read image dimensions");
        }

        inUpload.splice(inUpload.indexOf(filename), 1);

        return context.prisma.image.create({
          data: {
            ...toPixivModel(pixivResult, matchesUrl[2]),
            filename,
            height: metadata.height,
            width: metadata.width,
          },
        });
      })(),
    );
  }

  return Promise.all(resultPromises);
}

async function createImageFromArtStation(
  parent: void,
  artStationId: string,
  context: Context,
) {
  const asResult = await fetchArtStation(artStationId);

  const resultPromises = [];

  for (let i = 0; i < asResult.assets.length; i++) {
    resultPromises.push(
      (async () => {
        const asset = asResult.assets[i];

        if (asset.asset_type !== "image") {
          return;
        }

        if (!asset.image_url) {
          throw new Error("no image url");
        }

        const res = await fetch(asset.image_url);

        if (!res.ok) {
          throw new Error("failed to fetch image");
        }

        if (!res.body) {
          throw new Error("no body in response");
        }

        const streamWithFileType = await fileTypeStream(
          Readable.fromWeb(res.body as ReadableStream<Uint8Array>),
        );

        if (
          !streamWithFileType.fileType ||
          !/^image\/(jpeg|gif|png|webp|avif)$/.test(
            streamWithFileType.fileType.mime,
          )
        ) {
          throw new Error("not an image");
        }

        if (streamWithFileType.fileType.mime === "image/gif") {
          return;
        }

        const filename = `${asset.id}.avif`;

        if (
          await context.prisma.image.findUnique({
            where: {
              filename,
            },
          })
        ) {
          // throw new Error("already exists");
          return;
        }

        if (inUpload.includes(filename)) {
          throw new Error("already uploading");
        }

        inUpload.push(filename);

        const transform = sharp().avif({ quality: 90 });

        const out = fs.createWriteStream(
          path.resolve(context.imgFolder, filename),
        );

        streamWithFileType.pipe(transform).pipe(out);

        await finished(out);
        out.close();

        const metadata = await sharp(
          path.resolve(context.imgFolder, filename),
        ).metadata();

        if (!metadata.width || !metadata.height) {
          throw new Error("cant read image dimensions");
        }

        inUpload.splice(inUpload.indexOf(filename), 1);

        const image = context.prisma.image.create({
          data: {
            ...toArtStationModel(asResult, asset),
            filename,
            height: metadata.height,
            width: metadata.width,
          },
        });

        return image;
      })(),
    );
  }

  return await Promise.all(resultPromises);
}

async function createImageFromUrl(
  parent: void,
  { url }: { url: string },
  context: Context,
) {
  let matches = url.match(
    /https?:\/\/www\.pixiv\.net(?:\/en)?\/artworks\/(\d+)/,
  );

  if (matches) {
    const pixivId = matches[1];

    return createImageFromPixiv(parent, pixivId, context);
  }

  matches = url.match(
    /https?:\/\/www\.artstation\.com\/artwork\/([\dA-Za-z]+)/,
  );

  if (!matches) {
    throw new Error("not a valid url");
  }

  const artStationId = matches[1];

  return await createImageFromArtStation(parent, artStationId, context);
}

export default createImageFromUrl;
