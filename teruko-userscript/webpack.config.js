const path = require("path");
const webpack = require("webpack");
const webpackUserscript = require("webpack-userscript");

module.exports = {
    entry: "./src/index.user.ts",
    output: {
        filename: "teruko-userscript.user.js",
        // eslint-disable-next-line no-undef
        path: path.resolve(__dirname, "dist"),
        chunkFormat: "array-push"
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            babelrc: false,
                            presets: [
                                ["@babel/preset-typescript"]
                            ]
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    mode: "none",
    devServer: {
        port: 9000,
        client: {
            webSocketURL: "ws://localhost:9000/ws"
        },
        allowedHosts: [
            "i.pximg.net",
            "pixiv.net"
        ]
    },
    plugins: [
        new webpackUserscript({
            headers: "./meta.json"
        }),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("development")
        })
    ],
    externals: [],
    target: "es2020",
    devtool: "source-map"
};