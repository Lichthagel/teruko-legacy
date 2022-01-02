import { Service } from "node-windows";
import { config } from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

config();

const __dirname = dirname(fileURLToPath(import.meta.url));

var svc = new Service({
    name: "Teruko Server",
    description: "Teruko Server",
    script: path.join(__dirname, "../build/index.js"),
    env: [
        { name: "NODE_ENV", value: "production" },
        { name: "DATABASE_URL", value: process.env.DATABASE_URL },
        { name: "IMG_FOLDER", value: process.env.IMG_FOLDER },
        { name: "UV_THREADPOOL_SIZE", value: process.env.UV_THREADPOOL_SIZE }
    ]
});

svc.on("install", () => {
    svc.start();
});

svc.on("uninstall", () => {
    console.log('Uninstall complete.');
    console.log('The service exists: ', svc.exists);
});

export default svc;