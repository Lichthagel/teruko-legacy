import { Image, Prisma } from "@prisma/client";
import { Context } from "../../context.js";
import { ImageSort } from "../../models/Image.js";

function getTagQuery(tag: string, index: number) {
    return `"_ImageToTag"."B" = $${index + 2}`;
}
function parseSort(sort: ImageSort): Prisma.ImageOrderByWithRelationInput | undefined {
    if (sort === ImageSort.Newest) {
        return {
            createdAt: "desc"
        };
    } else if (sort === ImageSort.Oldest) {
        return {
            createdAt: "asc"
        };
    } else if (sort === ImageSort.LastUpdated) {
        return {
            updatedAt: "desc"
        };
    } else {
        return undefined;
    }
}

async function images(parent: void, args: { skip?: number; take?: number; sort?: ImageSort; tags?: string[] }, context: Context) {
    if (args.sort === ImageSort.Random) {
        if (!args.tags || args.tags.length === 0) {
            return await context.prisma.$queryRaw<Image[]>`SELECT * FROM "Image" WHERE id IN (SELECT id FROM "Image" ORDER BY RANDOM() LIMIT ${args.take || 10})`;
        } else {
            const whereClause = args.tags.map((tag, index) => getTagQuery(tag, index)).join(" OR ");

            // const parameters = args.tags;
            // parameters.push((args.take || 10).toString());
            return await context.prisma.$queryRawUnsafe<Image[]>(`SELECT * 
            FROM "Image"
            WHERE "id" IN (
                SELECT "_ImageToTag"."A" AS "id"
                FROM "_ImageToTag"
                WHERE (
                    "_ImageToTag"."A" IS NOT NULL
                    AND (${whereClause})
                )
                ORDER BY RANDOM()
                LIMIT $1
            )
            ORDER BY RANDOM();`, args.take, ...args.tags);
        }
    } else {
        const query: Prisma.ImageFindManyArgs = {
            skip: args.skip || 0,
            take: args.take || 10
        };

        if (args.tags && args.tags.length > 0) {
            query.where = {
                AND: args.tags.map(tag => ({
                    tags: {
                        some: {
                            slug: tag
                        }
                    }
                }))
            };
        }

        if (args.sort) {
            query.orderBy = parseSort(args.sort);
        }

        return context.prisma.image.findMany(query);
    }
}

export default images;