// displays and moves all images from image folder that are not in the db to image folder/missing
import { opendir, rename } from "fs/promises";
import path from "path";
import context from "../context.js";

(async function() {
    try {
        const dir = await opendir(context.imgFolder);
        for await (const dirent of dir) {
            if (!dirent.isFile()) continue;

            const image = await context.prisma.image.findUnique({
                where: {
                    filename: dirent.name
                }
            });

            if (!image) {
                console.log(`missing: ${dirent.name}`);

                await rename(path.join(context.imgFolder, dirent.name), path.join(context.imgFolder, "missing", dirent.name));

                console.log("moved");
            }
        }
    } catch (err) {
        console.error(err);
    }
})();