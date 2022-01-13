import { GraphQLUpload, graphqlUploadExpress } from "graphql-upload";
import { ApolloServer } from "apollo-server-express";
import context from "./context.js";
import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import resolvers from "./resolvers/index.js";
import { fileURLToPath } from "url";
import sharp from "sharp";
import archiver from "archiver";
import { fileTypeStream } from "file-type";
import random from "./resolvers/Query/random.js";

process.setMaxListeners(0);

const port = 3030;

(async function() {
    const app = express();

    app.use(
        "/img",
        express.static(context.imgFolder, {
            index: false
        })
    );

    app.get(
        "/original/:id",
        async (req, res) => {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).send("not a valid id");
                return;
            }

            const image = await context.prisma.image.findUnique({
                where: {
                    id
                }
            });

            if (!image) {
                res.status(404).send("not found");
                return;
            }

            res.attachment(image.filename);

            fs.createReadStream(path.join(context.imgFolder, image.filename)).pipe(res);
        }
    );

    app.get(
        "/webp/:id",
        async (req, res) => {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).send("not a valid id");
                return;
            }

            const image = await context.prisma.image.findUnique({
                where: {
                    id
                }
            });

            if (!image) {
                res.status(404).send("not found");
                return;
            }

            res.attachment(image.filename.replace(/[^./\\]+$/, "webp"));

            sharp(path.join(context.imgFolder, image.filename))
                .webp({ quality: 100 })
                .pipe(res);
        }
    );

    app.get(
        "/avif/:id",
        async (req, res) => {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).send("not a valid id");
                return;
            }

            const image = await context.prisma.image.findUnique({
                where: {
                    id
                }
            });

            if (!image) {
                res.status(404).send("not found");
                return;
            }

            res.attachment(image.filename.replace(/[^./\\]+$/, "avif"));

            sharp(path.join(context.imgFolder, image.filename))
                .avif({ quality: 90 })
                .pipe(res);
        }
    );

    app.get(
        "/random",
        async (req, res) => {
            const image = await random(undefined, { orientation: req.query.orientation ? (req.query.orientation as "landscape" | "portrait") : undefined }, context);

            if (!image) {
                res.status(404).send("not found");
                return;
            }

            res.header("Cache-Control", "max-age=0, no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", "Thu, 01 Jan 1970 00:00:00 GMT");

            const streamWithType = await fileTypeStream(fs.createReadStream(path.join(context.imgFolder, image.filename)));

            // res.attachment(image.filename);
            res.header("Content-Type", streamWithType.fileType?.mime);

            streamWithType.pipe(res);
        }
    );

    app.get(
        "/zip/:slug",
        async (req, res) => {
            const slug = req.params.slug;

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

            res.attachment(`${slug}.zip`);

            archive.pipe(res);

            for (const image of images) {
                archive.file(path.join(context.imgFolder, image.filename), { name: image.filename });
            }

            await archive.finalize();
        }
    );

    const apolloServer = new ApolloServer({
        typeDefs: fs.readFileSync(
            path.join(dirname(fileURLToPath(import.meta.url)), "../schema.graphql"),
            "utf8"
        ),
        resolvers: {
            ...resolvers,
            Upload: GraphQLUpload
        },
        context
    });

    await apolloServer.start();

    app.use(graphqlUploadExpress());
    apolloServer.applyMiddleware({ app });

    if (process.env.FRONTEND_FOLDER) {
        app.use(express.static(path.resolve(process.env.FRONTEND_FOLDER), {}));

        app.use((req, res) => {
            res.sendFile(path.resolve(process.env.FRONTEND_FOLDER || "", "index.html"));
        });
    }

    app.listen(port, () => {
        console.log(`Teruko-Server listening on port ${port}`);
        console.log(`GraphQL on ${apolloServer.graphqlPath}`);
    });
})();
