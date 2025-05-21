const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

module.exports = (env) => {
  const isProd = env.production;
  return {
    entry: "./webpack/index.js",  // Ensure this is the correct entry point
    output: {
      path: path.resolve(__dirname, "public/dist"),
      publicPath: "/dist/",
      filename: isProd ? "main.[contenthash].js" : "main.js",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProd ? "styles.[contenthash].css" : "styles.css",
      }),
      ...(isProd
        ? [
            new WebpackManifestPlugin({
              fileName: "manifest.json",
              publicPath: "/dist/",
            }),
          ]
        : []),
    ],
  };
};
