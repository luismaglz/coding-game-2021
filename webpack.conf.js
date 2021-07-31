const path = require("path");

module.exports = {
  mode: "production",
  context: path.join(__dirname, "games"),
  entry: {
    "tic-tac-toe": "./tic-tac-toe.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  output: {
    filename: "tic-tac-toe.js",
    path: path.resolve(__dirname, "dist"),
  },
};
