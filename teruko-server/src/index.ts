/* eslint-disable @typescript-eslint/no-misused-promises */
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { getListenArgs } from "@derhuerst/systemd";
import archiver from "archiver";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { fileTypeStream } from "file-type";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { chmod, createReadStream } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import { ListenOptions } from "node:net";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import context from "./context.js";
import resolvers from "./resolvers/index.js";
import random from "./resolvers/Query/random.js";

process.setMaxListeners(0);

const app = express();

app.use(
  "/img",
  express.static(context.imgFolder, {
    index: false,
  }),
);

app.get("/original/:id", async (req, res) => {
  const image = await context.prisma.image.findUnique({
    where: {
      id: Number.parseInt(req.params.id),
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
      id: Number.parseInt(req.params.id),
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
      id: Number.parseInt(req.params.id),
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
      orientation: req.query.orientation ?
          (req.query.orientation as "landscape" | "portrait") :
        undefined,
    },
    context,
  );

  if (!image) {
    res.status(404).send("not found");
    return;
  }

  res.header("Cache-Control", "max-age=0, no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "Thu, 01 Jan 1970 00:00:00 GMT");

  const streamWithType = await fileTypeStream(
    createReadStream(path.join(context.imgFolder, image.filename)),
  );

  // res.attachment(image.filename);
  res.header("Content-Type", streamWithType.fileType?.mime);

  streamWithType.pipe(res);
});

app.get("/zip/:slug", async (req, res) => {
  const slug = req.params.slug;

  const images = await context.prisma.image.findMany({
    where: {
      ImageToTag: {
        some: {
          Tag: {
            slug,
          },
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
    "utf8",
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
  }),
);

if (process.env.FRONTEND_FOLDER) {
  app.use(express.static(path.resolve(process.env.FRONTEND_FOLDER), {}));

  app.use((req, res) => {
    res.sendFile(path.resolve(process.env.FRONTEND_FOLDER || "", "index.html"));
  });
}

const server =
  process.env.SSL_KEY && process.env.SSL_CERT ?
    https.createServer(
      {
        key: await fs.readFile(process.env.SSL_KEY),
        cert: await fs.readFile(process.env.SSL_CERT),
      },
      app,
    ) :
    http.createServer(app);

const nonSocketArgs = context.port || context.socketAddress;

if (!nonSocketArgs) {
  throw new Error("PORT or SOCKET_ADDRESS must be set");
}

const listenArgs: [ListenOptions | number | string] = (
  getListenArgs as (
    ...nonSocketArgs: unknown[]
  ) => [ListenOptions | number | string]
)(nonSocketArgs);

server.listen(...listenArgs, () => {
  if (!context.port && context.socketAddress) {
    chmod(context.socketAddress, 0o666, (error) => {
      if (error) {
        console.error(error);
      }
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Teruko-Server listening on ${nonSocketArgs}`);
  // eslint-disable-next-line no-console
  console.log("GraphQL on /graphql");
});

const shutdown = async () => {
  // eslint-disable-next-line no-console
  console.log("Shutting down");
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  await apolloServer.stop();
  await context.prisma.$disconnect();
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("SIGQUIT", shutdown);
