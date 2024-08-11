import { Context } from "../../context.js";
import { Image } from "@prisma/client";

async function random(parent: void, { orientation }: { orientation: "landscape" | "portrait" | undefined | null }, context: Context) {
    switch (orientation) {
    case "portrait": {
        const res: Image[] = await context.prisma.$queryRaw<Image[]>`SELECT * FROM "Image" WHERE "Image"."height" > "Image"."width" ORDER BY RANDOM() LIMIT 1;`
        return res[0];
    }
    case "landscape": {
        const res: Image[] = await context.prisma.$queryRaw<Image[]>`SELECT * FROM "Image" WHERE "Image"."width" > "Image"."height" ORDER BY RANDOM() LIMIT 1;`
        return res[0];
    }
    case undefined: 
    case null: {
        const res: Image[] = await context.prisma.$queryRaw<Image[]>`SELECT * FROM "Image" ORDER BY RANDOM() LIMIT 1;`;
        return res[0];
    }
    default: {
        throw new Error(`not a valid orientation: ${orientation as string}`);
    }
    }
}

export default random;