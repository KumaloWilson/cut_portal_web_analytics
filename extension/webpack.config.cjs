const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development",
  entry: {
    background: "./src/background.ts",
    content: "./src/content.ts",
    popup: "./src/popup.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // This can help avoid problematic transforms
              compilerOptions: {
                module: "es2015"
              }
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "icons", to: "icons" },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "src/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
      // Add CSP settings directly to HTML files
      meta: {
        'Content-Security-Policy': {
          'http-equiv': 'Content-Security-Policy',
          'content': "script-src 'self'"
        }
      }
    }),
  ],
  // Add these to avoid problematic code generation
  devtool: 'inline-source-map',
  optimization: {
    minimize: false // Sometimes minimization can introduce problematic code
  }
};