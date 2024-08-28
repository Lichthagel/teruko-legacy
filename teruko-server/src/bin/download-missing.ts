// downloads image from pixiv that are missing in the image folder
import Prisma from "@prisma/client";
import { config } from "dotenv";
import { access } from "node:fs/promises";
import path from "node:path";

import context from "../context.js";
import createImageFromUrl from "../resolvers/Mutation/createImageFromUrl.js";

config();

const DOWNLOAD_COUNT = 500;

const prisma = context.prisma;

let downloaded = 0;

let skip = 0;

const results = [];

while (downloaded < DOWNLOAD_COUNT) {
  results.push(
    // eslint-disable-next-line unicorn/prefer-top-level-await
    (async () => {
      const images = await prisma.image.findMany({
        skip,
        take: 10,
        where: {
          tags: {
            none: {
              slug: "refetched",
            },
          },
        },
      });

      skip += 10;

      return Promise.all(
        images.map(async (image: Prisma.Image) => {
          try {
            await access(path.join(context.imgFolder, image.filename));
          } catch {
            const source = image.source;

            if (source && source.search("pixiv") >= 0) {
              await prisma.image.update({
                where: {
                  id: image.id,
                },
                data: {
                  tags: {
                    connectOrCreate: {
                      where: {
                        slug: "refetched",
                      },
                      create: {
                        slug: "refetched",
                      },
                    },
                  },
                },
              });

              downloaded++;

              try {
                await createImageFromUrl(undefined, { url: source }, context);
              } catch (error) {
                console.error(error);
              }
            }
          }
        }),
      );
    })(),
  );
}

await Promise.all(results);
