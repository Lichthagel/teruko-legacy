/* eslint-disable n/no-process-env */
import path from "node:path";
import sharp from "sharp";
import { Context } from "../context.js";

function database() {
    return process.env.DATABASE_URL;
}

function imageFolder(parent:void, args: void, context: Context) {
    return path.resolve(context.imgFolder);
}

function frontendFolder() {
    return process.env.FRONTEND_FOLDER ? path.resolve(process.env.FRONTEND_FOLDER) : undefined;
}

function uvThreadpoolSize() {
    return process.env.UV_THREADPOOL_SIZE;
}

function sharpConcurrency() {
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