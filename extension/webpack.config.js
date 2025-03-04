const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
    mode: "development",
    entry: {
        background: "./src/background.ts",
        content: "./src/content.ts",
        popup: "./src/popup-index.tsx",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/manifest.json", to: "manifest.json" },
                { from: "icons", to: "icons" },
            ],
        }),
        new HtmlWebpackPlugin({
            template: "./src/popup.html",
            filename: "popup.html",
            chunks: ["popup"],
        }),
    ],
    devtool: "cheap-module-source-map",
}

