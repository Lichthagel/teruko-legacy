import Prisma, { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

export type Context = {
  prisma: PrismaClient;
  imgFolder: string;
  socketAddress?: string;
  port?: number;
};

const context: Context = {
  prisma: new Prisma.PrismaClient({
    log: [
      "query",
      "info",
      "warn",
      "error",
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }),
  imgFolder: process.env.IMG_FOLDER || "./data",
  socketAddress: process.env.SOCKET_ADDRESS,
  port: process.env.PORT ? Number.parseInt(process.env.PORT) : undefined,
};

export default context;
