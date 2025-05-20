const { merge } = require("webpack-merge");
const common = require("./webpack");
const path = require("path");

module.exports = merge(common({ production: false }), {
  mode: "development",
  devtool: "eval-source-map", // You can keep this for source maps in development
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 8080,
    hot: true,               // Enable hot-reloading
    liveReload: true,        // Enable live reloading
    devMiddleware: {
      publicPath: "/dist/",
      writeToDisk: true,      // Write files to disk
    },
    proxy: [
      {
        context: ['/'],
        target: 'http://localhost:3000',
        secure: false,
      }
    ],
    historyApiFallback: true, // For single-page apps
  },
});
