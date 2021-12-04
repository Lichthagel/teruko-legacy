import Prisma, { PrismaClient } from "@prisma/client";
// import type { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

export interface Context {
    prisma: PrismaClient;
}

const context: Context = {
    prisma: new Prisma.PrismaClient({
        // log: ["query", "info", "warn", "error"]
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    })
};

export default context;