// downloads image from pixiv that are missing in the image folder
import Prisma from "@prisma/client";
import { config } from "dotenv";
import { access } from "fs/promises";
import createImageFromPixiv from "../resolvers/Mutation/createImageFromPixiv.js";
import context from "../context.js";
import path from "path";

config();

const DOWNLOAD_COUNT = 500;


const prisma = context.prisma;

(async function() {
    let downloaded = 0;

    let skip = 0;

    while (downloaded < DOWNLOAD_COUNT) {
        console.log("getting images");
        const images = await prisma.image.findMany({
            skip,
            take: 10,
            where: {
                tags: {
                    none: {
                        slug: "refetched"
                    }
                }
            }
        });

        skip += 10;

        await Promise.all(images.map(async (image: Prisma.Image) => {
            try {
                console.log("looking for file");
                await access(path.join(context.imgFolder, image.filename));
            } catch {
                const source = image.source;

                if (source && source.search("pixiv") >= 0) {

                    console.log(`fetching: ${image.filename}`);

                    await prisma.image.update({
                        where: {
                            id: image.id
                        },
                        data: {
                            tags: {
                                connectOrCreate: {
                                    where: {
                                        slug: "refetched"
                                    },
                                    create: {
                                        slug: "refetched"
                                    }
                                }
                            }
                        }
                    });

                    downloaded++;

                    try {
                        await createImageFromPixiv(undefined, { url: source }, context);
                    } catch (err) {
                        console.log("could not receive");
                        console.error(err);
                    }
                }
            }
        }));
    }
})();

