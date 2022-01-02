import { Context } from "../../context";
import { Image } from "@prisma/client";

async function random(parent: void, { orientation }: { orientation: "landscape" | "portrait" | undefined | null }, context: Context) {
    if (orientation === "portrait") {
        return context.prisma.$queryRaw<Image[]>`SELECT * FROM "Image" WHERE "Image"."height" > "Image"."width" ORDER BY RANDOM() LIMIT 1;`.then(res => res[0]);
    } else if (orientation === "landscape") {
        return context.prisma.$queryRaw<Image[]>`SELECT * FROM "Image" WHERE "Image"."width" > "Image"."height" ORDER BY RANDOM() LIMIT 1;`.then(res => res[0]);
    } else if (orientation === undefined || orientation === null) {
        return context.prisma.$queryRaw<Image[]>`SELECT * FROM "Image" ORDER BY RANDOM() LIMIT 1;`.then(res => res[0]);
    } else {
        throw new Error(`not a valid orientation: ${orientation}`);
    }
}

export default random;