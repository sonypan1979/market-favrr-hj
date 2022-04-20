/* eslint-disable @typescript-eslint/no-var-requires */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const AssetsPlugin = require("assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const CopyPlugin = require('copy-webpack-plugin');
// const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");
const package = require("./package.json");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
require("dotenv").config();

module.exports = (env, argv) => {
  const production = argv.mode == "production";

  console.log("Process env");
  console.log(process.env.GRAPHQL_URL);
  console.log(process.env.GRAPHQL_SUBSCRIPTION_URL);
  console.log(process.env.OCEANA_ENV);
  console.log(process.env.DISABLE_NFT_MINT);

  return {
    entry: "./src/index.tsx",
    output: {
      path: __dirname + "/build",
      filename: "static/bundle[fullhash].js",
      publicPath: "/",
    },
    devServer: {
      port: 3000,
      historyApiFallback: {
        index: "/",
      },
      publicPath: "",
      index: "static/index.html",
    },
    mode: production ? "production" : "development",
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          enforce: "pre",
          test: /\.tsx?/,
          loader: "eslint-loader",
          exclude: /node_modules/,
          options: {
            failOnWarning: false,
          },
        },
        {
          test: /\.tsx?/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.svg$/i,
          use: [
            "@svgr/webpack",
            {
              loader: "file-loader",
              options: {
                name: "[contenthash]_2.[ext]",
                publicpath: "/",
                outputPath: "static/images",
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                useRelativePath: false,
                publicpath: "/",
                outputPath: "static/images",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/template/index.template.html",
        filename: "static/index.html",
      }),
      new MiniCssExtractPlugin({ filename: "static/bundle[fullhash].css" }),
      //   new CopyPlugin([{ from: 'translation/content', to: 'static/content' }]),
      // new AssetsPlugin({ filename: "./build/assets.json" }),
      new webpack.EnvironmentPlugin([
        "GRAPHQL_URL",
        "GRAPHQL_SUBSCRIPTION_URL",
        "OCEANA_ENV",
        "DISABLE_NFT_MINT",
      ]),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(package.version),
      }),
      new NodePolyfillPlugin(),
    ],
    devtool: production ? "cheap-module-source-map" : "eval-source-map",
    resolve: {
      extensions: [".tsx", ".ts", ".json", ".js"],
      fallback: {
        http: require.resolve("stream-http"),
      },
    },
  };
};
