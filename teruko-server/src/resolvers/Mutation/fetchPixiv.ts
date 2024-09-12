import { Prisma } from "@prisma/client";
import https from "node:https";

import PixivIllustResult from "../../models/PixivIllustResult.js";

export async function fetchPixiv(pixivId: string): Promise<PixivIllustResult> {
  return new Promise<PixivIllustResult>((resolve, reject) => {
    const req = https.request({
      hostname: "www.pixiv.net",
      port: 443,
      path: `/ajax/illust/${pixivId}`,
      method: "GET",
      headers: {
        "Accept-Language": "en-US",
      },
    }, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        resolve(JSON.parse(responseBody) as PixivIllustResult);
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

export function toModel(pixivResult: PixivIllustResult, pixivIdFallback?: string): Partial<Prisma.ImageCreateInput> {
  const tags: Prisma.TagCreateOrConnectWithoutImageToTagInput[] = [
    {
      where: {
        slug: "pixiv",
      },
      create: {
        slug: "pixiv",
        category: {
          connectOrCreate: {
            where: {
              slug: "source",
            },
            create: {
              slug: "source",
              color: "#329650",
            },
          },
        },
      },
    },
  ];

  let title;
  let source;

  if (pixivResult.body) {
    if (pixivResult.body.userId) {
      const userId = `artist_${pixivResult.body.userId}`;
      tags.push({
        where: {
          slug: userId,
        },
        create: {
          slug: userId,
          category: {
            connectOrCreate: {
              where: {
                slug: "artist",
              },
              create: {
                slug: "artist",
                color: "#C81450",
              },
            },
          },
        },
      });
    }

    if (pixivResult.body.userName) {
      const userName = pixivResult.body.userName;

      if (userName !== "") {
        tags.push({
          where: {
            slug: userName,
          },
          create: {
            slug: userName,
            category: {
              connectOrCreate: {
                where: {
                  slug: "artist",
                },
                create: {
                  slug: "artist",
                  color: "#C81450",
                },
              },
            },
          },
        });
      }
    }

    if (pixivResult.body.isOriginal) {
      tags.push({
        where: {
          slug: "original",
        },
        create: {
          slug: "original",
        },
      });
    }

    if (pixivResult.body.aiType === 2) {
      tags.push({
        where: {
          slug: "AI-generated",
        },
        create: {
          slug: "AI-generated",
        },
      });
    }

    if (pixivResult.body.tags && pixivResult.body.tags.tags) {
      for (const tag of pixivResult.body.tags.tags) {
        const slug = (tag.translation && tag.translation.en) || tag.romaji || tag.tag;

        if (slug !== "") {
          tags.push({
            where: {
              slug,
            },
            create: {
              slug,
            },
          });
        }
      }
    }

    title = pixivResult.body.illustTitle;
    const illustId = pixivResult.body.illustId || pixivIdFallback;
    source = illustId ? `https://www.pixiv.net/en/artworks/${illustId}` : undefined;
  }

  const uniqueTags = tags.filter((tag, index, self) => self.findIndex((t) => t.where.slug === tag.where.slug) === index);

  return {
    title,
    source,
    ImageToTag: {
      create: uniqueTags.map((tag) => ({
        Tag: { connectOrCreate: tag },
      })),
    },
  };
}
