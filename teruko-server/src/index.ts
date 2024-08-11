import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
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
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import http from "http";
import https from "https";

process.setMaxListeners(0);

const port = 3030;

(async function () {
  const app = express();

  app.use(
    "/img",
    express.static(context.imgFolder, {
      index: false,
    })
  );

  app.get("/original/:id", async (req, res) => {
    const image = await context.prisma.image.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!image) {
      res.status(404).send("not found");
      return;
    }

    res.attachment(image.filename);

    fs.createReadStream(path.join(context.imgFolder, image.filename)).pipe(res);
  });

  app.get("/webp/:id", async (req, res) => {
    const image = await context.prisma.image.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!image) {
      res.status(404).send("not found");
      return;
    }

    res.attachment(image.filename.replace(/[^./\\]+$/, "webp"));

    sharp(path.join(context.imgFolder, image.filename))
      .webp({ quality: 100 })
      .pipe(res);
  });

  app.get("/avif/:id", async (req, res) => {
    const image = await context.prisma.image.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!image) {
      res.status(404).send("not found");
      return;
    }

    res.attachment(image.filename.replace(/[^./\\]+$/, "avif"));

    sharp(path.join(context.imgFolder, image.filename))
      .avif({ quality: 90 })
      .pipe(res);
  });

  app.get("/random", async (req, res) => {
    const image = await random(
      undefined,
      {
        orientation: req.query.orientation
          ? (req.query.orientation as "landscape" | "portrait")
          : undefined,
      },
      context
    );

    if (!image) {
      res.status(404).send("not found");
      return;
    }

    res.header(
      "Cache-Control",
      "max-age=0, no-cache, no-store, must-revalidate"
    );
    res.header("Pragma", "no-cache");
    res.header("Expires", "Thu, 01 Jan 1970 00:00:00 GMT");

    const streamWithType = await fileTypeStream(
      fs.createReadStream(path.join(context.imgFolder, image.filename))
    );

    // res.attachment(image.filename);
    res.header("Content-Type", streamWithType.fileType?.mime);

    streamWithType.pipe(res);
  });

  app.get("/zip/:slug", async (req, res) => {
    const slug = req.params.slug;

    const images = await context.prisma.image.findMany({
      where: {
        tags: {
          some: {
            slug,
          },
        },
      },
    });

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    res.attachment(`${slug}.zip`);

    archive.pipe(res);

    for (const image of images) {
      archive.file(path.join(context.imgFolder, image.filename), {
        name: image.filename,
      });
    }

    await archive.finalize();
  });

  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer({
    typeDefs: fs.readFileSync(
      path.join(dirname(fileURLToPath(import.meta.url)), "../schema.graphql"),
      "utf8"
    ),
    resolvers: {
      ...resolvers,
      Upload: GraphQLUpload,
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  app.use(graphqlUploadExpress());
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => context,
    })
  );

  if (process.env.FRONTEND_FOLDER) {
    app.use(express.static(path.resolve(process.env.FRONTEND_FOLDER), {}));

    app.use((req, res) => {
      res.sendFile(
        path.resolve(process.env.FRONTEND_FOLDER || "", "index.html")
      );
    });
  }

  let server;

  if (process.env.SSL_KEY && process.env.SSL_CERT) {
    server = https.createServer(
      {
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT),
      },
      app
    );
  } else {
    server = http.createServer(app);
  }

  server.listen(port, () => {
    console.log(`Teruko-Server listening on port ${port}`);
    console.log("GraphQL on /graphql");
  });
})();
