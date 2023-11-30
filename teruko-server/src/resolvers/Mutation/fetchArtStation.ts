import ArtStationIllust, { ArtStationAsset } from "../../models/ArtStationIllust.js";
import { Prisma } from "@prisma/client";
import https from "https";

export async function fetchArtStation(artStationId: string): Promise<ArtStationIllust> {
    return new Promise<ArtStationIllust>((resolve, reject) => {
        const req = https.request({
            hostname: "www.artstation.com",
            port: 443,
            path: `/projects/${artStationId}.json`,
            method: "GET",
            headers: {
                "Accept-Language": "en-US"
            }
        }, res => {
            res.setEncoding("utf8");
            let responseBody = "";

            res.on("data", (chunk) => {
                responseBody += chunk;
            });

            res.on("end", () => {
                resolve(JSON.parse(responseBody));
            });
        });

        req.on("error", (err) => {
            reject(err);
        });

        req.end();
    });
}

export function toModel(artStationIllust: ArtStationIllust, asset: ArtStationAsset): Partial<Prisma.ImageCreateInput> {
    const tags: Prisma.TagCreateOrConnectWithoutImagesInput[] = [
        {
            where: {
                slug: "ArtStation"
            },
            create: {
                slug: "ArtStation",
                category: {
                    connectOrCreate: {
                        where: {
                            slug: "source"
                        },
                        create: {
                            slug: "source",
                            color: "#329650"
                        }
                    }
                }
            }
        }
    ];


    if (artStationIllust.user.username) {
        const userId = `artist_${artStationIllust.user.username}`;
        tags.push({
            where: {
                slug: userId
            },
            create: {
                slug: userId,
                category: {
                    connectOrCreate: {
                        where: {
                            slug: "artist"
                        },
                        create: {
                            slug: "artist",
                            color: "#C81450"
                        }
                    }
                }
            }
        });
    }

    if (artStationIllust.user.full_name) {
        const userName = artStationIllust.user.full_name;

        if (userName !== "") {
            tags.push({
                where: {
                    slug: userName
                },
                create: {
                    slug: userName,
                    category: {
                        connectOrCreate: {
                            where: {
                                slug: "artist"
                            },
                            create: {
                                slug: "artist",
                                color: "#C81450"
                            }
                        }
                    }
                }
            });
        }
    }

    if (artStationIllust.tags) {
        for (const tag of artStationIllust.tags) {

            if (tag !== "") {
                tags.push({
                    where: {
                        slug: tag
                    },
                    create: {
                        slug: tag
                    }
                });
            }
        }
    }

    const title = artStationIllust.title + (asset.title && asset.title !== "" ? ` - ${asset.title}` : "");
    const source = artStationIllust.permalink;


    return {
        title,
        source,
        tags: {
            connectOrCreate: tags
        }
    };
}