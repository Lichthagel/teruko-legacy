/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable n/no-process-env */
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import context from "./context.js";
import express from "express";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path, { dirname } from "node:path";
import resolvers from "./resolvers/index.js";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import archiver from "archiver";
import { fileTypeStream } from "file-type";
import random from "./resolvers/Query/random.js";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import http from "node:http";
import https from "node:https";
import { getListenArgs } from "@derhuerst/systemd";
import { ListenOptions } from "node:net";

process.setMaxListeners(0);

const port = 3030;

const app = express();

app.use(
  "/img",
  // eslint-disable-next-line import/no-named-as-default-member
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

  createReadStream(path.join(context.imgFolder, image.filename)).pipe(res);
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

  res.header("Cache-Control", "max-age=0, no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "Thu, 01 Jan 1970 00:00:00 GMT");

  const streamWithType = await fileTypeStream(
    createReadStream(path.join(context.imgFolder, image.filename))
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
  typeDefs: await fs.readFile(
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
    // eslint-disable-next-line @typescript-eslint/require-await
    context: async () => context,
  })
);

if (process.env.FRONTEND_FOLDER) {
  // eslint-disable-next-line import/no-named-as-default-member
  app.use(express.static(path.resolve(process.env.FRONTEND_FOLDER), {}));

  app.use((req, res) => {
    res.sendFile(path.resolve(process.env.FRONTEND_FOLDER || "", "index.html"));
  });
}

const server =
  process.env.SSL_KEY && process.env.SSL_CERT
    ? https.createServer(
        {
          key: await fs.readFile(process.env.SSL_KEY),
          cert: await fs.readFile(process.env.SSL_CERT),
        },
        app
      )
    : http.createServer(app);

const listenArgs: [number | string | ListenOptions] = (
  getListenArgs as () => [number | string | ListenOptions]
)() || [port];

server.listen(...listenArgs, () => {
  console.log(`Teruko-Server listening on port ${port}`);
  console.log("GraphQL on /graphql");
});
