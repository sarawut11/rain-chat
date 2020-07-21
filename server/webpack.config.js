// @ts-nocheck

const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

// function srcPath(subdir) {
//   return path.join(__dirname, subdir);
// }

const config = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'node',
  output: {
    // Puts the output at the root of the dist folder
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.ts', '.js'],
    modules: ['node_modules', 'src'],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        test: /\.ts$/,
        ts: {
          compiler: 'typescript',
          configFileName: 'tsconfig.json',
        },
        tslint: {
          emitErrors: true,
          failOnHint: true,
        },
      },
    }),
    new CopyWebpackPlugin({ patterns: [{ from: 'public', to: 'public' }] }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader',
      },
    ],
  },
  externals: [nodeExternals()],
};

module.exports = (env, argv) => {
  if (!argv.prod) {
    config.devtool = 'source-map';
  }
  config.resolve.alias = {
    '@utils': path.join(__dirname, 'src/app/utils/index.ts'),
    '@models': path.join(__dirname, 'src/app/models/index.ts'),
    '@sockets': path.join(__dirname, 'src/app/socket/index.ts'),
    '@context': path.join(__dirname, 'src/app/context/index.ts'),
    '@services': path.join(__dirname, 'src/app/services/index.ts'),
    '@controllers': path.join(__dirname, 'src/app/controllers/index.ts'),
    '@middlewares': path.join(__dirname, 'src/app/middlewares/index.ts'),
  };
  return config;
};
