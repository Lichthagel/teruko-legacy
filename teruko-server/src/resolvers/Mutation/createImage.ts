import { Context } from "../../context.js";
import { FileUpload } from "graphql-upload/Upload.mjs";
import { finished } from "stream/promises";
import fs from "fs";
import { fileTypeStream } from "file-type";
import { fetchPixiv, toModel } from "./fetchPixiv.js";
import path from "path";
import sharp from "sharp";
import { createId } from "@paralleldrive/cuid2";

const inUpload: string[] = [];

async function createImage(
  parent: void,
  { files }: { files: FileUpload[] },
  context: Context
) {
  return Promise.all(
    files.map(async (file: FileUpload) => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const resolvedFile = await file;
      const filename = resolvedFile.filename.replace(/[^./\\]+$/, "avif");

      const stream = resolvedFile.createReadStream();

      const streamWithFileType = await fileTypeStream(stream);

      if (
        !streamWithFileType.fileType ||
        !streamWithFileType.fileType.mime.match(
          /^image\/(jpeg|gif|png|webp|avif)$/
        )
      ) {
        throw new Error("not an image");
      }

      if (
        await context.prisma.image.findUnique({
          where: {
            filename,
          },
        })
      ) {
        return Promise.reject(new Error("already exists"));
      }

      if (inUpload.findIndex((val) => val === filename) >= 0) {
        return Promise.reject(new Error("already uploading"));
      }

      inUpload.push(filename);

      const transform = sharp().avif({ quality: 90 });

      const out = fs.createWriteStream(path.join(context.imgFolder, filename));

      streamWithFileType.pipe(transform).pipe(out);

      await finished(out);
      out.close();

      const metadata = await sharp(
        path.join(context.imgFolder, filename)
      ).metadata();

      if (!metadata.width || !metadata.height)
        throw new Error("cant read image dimensions");

      // PIXIV stuff
      const matches = filename.match(
        /([0-9]+)_p[0-9]+\.(?:jpg|png|gif|jpeg|webp|avif)/
      );
      if (matches) {
        const pixivId = matches[1];

        const newImage = await context.prisma.image.create({
          data: {
            ...toModel(await fetchPixiv(pixivId), pixivId),
            id: createId(),
            filename,
            width: metadata.width,
            height: metadata.height,
          },
        });

        inUpload.splice(
          inUpload.findIndex((val) => val === filename),
          1
        );

        return newImage;
      }

      const newImage = await context.prisma.image.create({
        data: {
          id: createId(),
          filename,
          tags: {
            connectOrCreate: [
              {
                where: {
                  slug: "untagged",
                },
                create: {
                  slug: "untagged",
                },
              },
            ],
          },
          width: metadata.width,
          height: metadata.height,
        },
      });

      inUpload.splice(
        inUpload.findIndex((val) => val === filename),
        1
      );

      return newImage;
    })
  );
}

export default createImage;
