const { merge } = require("webpack-merge");
const common = require("./webpack.common");

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common({ production: true }), {
  output: {
    path: path.resolve('/app', "public/dist"),
  },
  mode: "production",
  devtool: false,
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
});
