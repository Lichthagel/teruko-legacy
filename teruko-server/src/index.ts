import fastify from "fastify";
import { createGraphQLServer } from "graphql-yoga";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import resolvers from "./resolvers/index.js";
import context from "./context.js";
import fastifyStatic from "fastify-static";
import { fileTypeStream } from "file-type";
import sharp from "sharp";
import archiver from "archiver";
import fastifyCors from "fastify-cors";
import fastifyMultipart from "fastify-multipart";

process.setMaxListeners(0);

const port = 3030;

const app = fastify({ logger: process.env.NODE_ENV === "development", maxParamLength: 10000 });

const gqlServer = createGraphQLServer({
    typeDefs: fs.readFileSync(
        path.join(dirname(fileURLToPath(import.meta.url)), "../schema.graphql"),
        "utf8"
    ),
    resolvers,
    context: () => Promise.resolve(context),
    cors: true,
    isDev: process.env.NODE_ENV === "development"
});

app.register(fastifyCors);

app.register(fastifyMultipart);

app.register(fastifyStatic, {
    root: context.imgFolder,
    prefix: "/img"
});

app.get("/original/:id", async (request, reply) => {
    const id = parseInt((request.params as { id: string }).id);
    if (isNaN(id)) {
        reply.status(400).send("not a valid id");
        return;
    }

    const image = await context.prisma.image.findUnique({
        where: {
            id
        }
    });

    if (!image) {
        reply.status(404).send("not found");
        return;
    }

    const readStream = fs.createReadStream(path.join(context.imgFolder, image.filename));

    const withFileType = await fileTypeStream(readStream);

    reply.header("Content-Type", withFileType.fileType?.mime);
    reply.header("Content-Disposition", `attachment; filename=${image.filename}`);

    reply.send(withFileType);
});

app.get("/webp/:id", async (request, reply) => {
    const id = parseInt((request.params as { id: string }).id);
    if (isNaN(id)) {
        reply.status(400).send("not a valid id");
        return;
    }

    const image = await context.prisma.image.findUnique({
        where: {
            id
        }
    });

    if (!image) {
        reply.status(404).send("not found");
        return;
    }

    reply.header("Content-Type", "image/webp");
    reply.header("Content-Disposition", `attachment; filename=${image.filename.replace(/[^./\\]+$/, "webp")}`);

    reply.send(sharp(path.join(context.imgFolder, image.filename)).webp({ quality: 100 }));
});

app.get("/zip/:slug", async (request, reply) => {
    const slug = (request.params as { slug: string }).slug;

    const images = await context.prisma.image.findMany({
        where: {
            tags: {
                some: {
                    slug
                }
            }
        }
    });

    const archive = archiver("zip", {
        zlib: { level: 9 }
    });

    reply.header("Content-Type", "application/zip");
    reply.header("Content-Disposition", `attachment; filename=${encodeURIComponent(slug)}.zip`);

    reply.send(archive);

    for (const image of images) {
        archive.file(path.join(context.imgFolder, image.filename), { name: image.filename });
    }

    await archive.finalize();
});

app.route({
    url: "/graphql",
    method: ["GET", "POST", "OPTIONS"],
    handler: async (request, reply) => {
        const response = await gqlServer.handleIncomingMessage(request);
        response.headers.forEach((val, key) => {
            reply.header(key, val);
        });

        reply.status(response.status);
        reply.send(response.body);
    }
});

app.listen(port, "::", (err) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});