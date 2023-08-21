const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");




module.exports = {
    entry: './js/src/script.js', 
    output: {
        filename: 'bundle.js', 
        path:  __dirname + '/js/dist/' 
    },
    mode: 'development',
};

module.exports = {
  entry: "./css/style.css", // Path to your main CSS file
  output: {
    path: __dirname + "/css/", // Output directory
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "style.min.css", // Minified CSS filename
    }),
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // Minimize CSS using CssMinimizerPlugin
    ],
  },
};