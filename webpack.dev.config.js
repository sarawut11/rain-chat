// eslint-disable-next-line import/no-extraneous-dependencies
const merge = require('webpack-merge');
const path = require('path');
const dotenv = require('dotenv');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');
// eslint-disable-next-line import/no-extraneous-dependencies
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const commonConfig = require('./webpack.common.config.js');

const env = dotenv.config().parsed;
// reduce it to a nice object, the same as before
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = merge(commonConfig, {
  mode: 'development',
  optimization: {
    usedExports: true,
  },
  devtool: 'inline-source-map',
  entry: {
    app: ['babel-polyfill', 'react-hot-loader/patch', path.resolve(__dirname, 'src/index.js')],
  },
  output: {
    /* It should have been [chunkhash] here, 
    but because [chunkhash] and react-hot-loader are not compatible. 
    Can only compromise */
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, './build'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'react-hot-loader/webpack',
        include: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
    ],
  },
  devServer: {
    contentBase: path.resolve(__dirname, './src'), // Let the WEB server run static resources (index.html)
    hot: true,
    historyApiFallback: true,
    compress: true,
    stats: 'errors-only', // Output only when an error occurs
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ProgressBarPlugin(),
    new webpack.DefinePlugin(envKeys),
  ],
});
