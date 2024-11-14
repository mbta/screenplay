const path = require("path");
const glob = require("glob");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, options) => ({
  optimization: {
    minimizer: [new TerserPlugin({ parallel: true }), new CssMinimizerPlugin()],
  },
  entry: {
    app: glob.sync("./vendor/**/*.js").concat(["./js/app.tsx"]),
  },
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "../priv/static/js"),
    publicPath: "/js/",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(png|jpe?g|svg|gif|jp2|webp)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      // Please also update the "paths" list in tsconfig.json when you add aliases here!
      Components: path.resolve(__dirname, "js/components/Dashboard"),
      Hooks: path.resolve(__dirname, "js/hooks"),
      Models: path.resolve(__dirname, "js/models"),
      Utils: path.resolve(__dirname, "js/utils"),
      Constants: path.resolve(__dirname, "js/constants"),
      Styles: path.resolve(__dirname, "css"),
      // Fix issue with React JSX rutime export
      // https://github.com/facebook/react/issues/20235#issuecomment-732205073
      // This is fixed in later versions of react so this can be removed when
      // upgrading react. Keeping it in shouldn't hurt anything.
      "react/jsx-runtime": require.resolve("react/jsx-runtime"),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: "../css/app.css" }),
    new CopyWebpackPlugin({ patterns: [{ from: "static/", to: "../" }] }),
  ],
});
