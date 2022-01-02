import path from "path";
import sharp from "sharp";
import { Context } from "../context";

async function database() {
    return process.env.DATABASE_URL;
}

async function imageFolder(parent:void, args: void, context: Context) {
    return path.resolve(context.imgFolder);
}

async function frontendFolder() {
    return process.env.FRONTEND_FOLDER ? path.resolve(process.env.FRONTEND_FOLDER) : undefined;
}

async function uvThreadpoolSize() {
    return process.env.UV_THREADPOOL_SIZE;
}

async function sharpConcurrency() {
    return sharp.concurrency();
}

const Config = {
    database,
    imageFolder,
    frontendFolder,
    uvThreadpoolSize,
    sharpConcurrency
};

export default Config;