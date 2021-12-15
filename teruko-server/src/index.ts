import { GraphQLUpload, graphqlUploadExpress } from "graphql-upload";
import { ApolloServer } from "apollo-server-express";
import context from "./context.js";
import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import resolvers from "./resolvers/index.js";
import { fileURLToPath } from "url";
import sharp from "sharp";

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

    app.listen(port, () => {
        console.log(`Teruko-Server listening on port ${port}`);
        console.log(`GraphQL on ${apolloServer.graphqlPath}`);
    });
})();
