/* eslint-disable no-console */
// displays and moves all images from image folder that are not in the db to image folder/missing
import { opendir, rename } from "node:fs/promises";
import path from "node:path";

import context from "../context.js";

try {
  const dir = await opendir(context.imgFolder);
  for await (const dirent of dir) {
    if (!dirent.isFile()) {
      continue;
    }

    const image = await context.prisma.image.findUnique({
      where: {
        filename: dirent.name,
      },
    });

    if (!image) {
      console.log(`missing: ${dirent.name}`);

      await rename(
        path.join(context.imgFolder, dirent.name),
        path.join(context.imgFolder, "missing", dirent.name),
      );

      console.log("moved");
    }
  }
} catch (error) {
  console.error(error);
}
