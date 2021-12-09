import Prisma, { PrismaClient } from "@prisma/client";
// import type { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

export interface Context {
    prisma: PrismaClient;
    imgFolder: string;
}

const context: Context = {
    prisma: new Prisma.PrismaClient({
        // log: ["query", "info", "warn", "error"]
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    }),
    imgFolder: process.env.IMG_FOLDER || "./data"
};

export default context;