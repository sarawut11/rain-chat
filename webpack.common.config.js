const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  output: {
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/',
  },
  /* Files ending in .js under the src folder must be parsed using babel */
  /* cacheDirectory is used to cache compilation results, the next compilation speed up */
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: ['babel-loader?cacheDirectory=true'],
        include: path.resolve(__dirname, 'src'),
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, // Images less than or equal to 8K will be converted to base64 encoding and inserted directly into HTML to reduce HTTP requests.
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // Automatically insert js into the template index.html every time
      filename: 'index.html',
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
};
