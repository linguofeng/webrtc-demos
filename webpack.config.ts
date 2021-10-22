import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';

const plugins = [
  new HtmlWebpackPlugin({
    template: 'public/index.html',
  }),
  new ForkTsCheckerWebpackPlugin({
    typescript: {
      diagnosticOptions: {
        semantic: true,
        syntactic: true,
      },
      mode: 'write-references',
    },
  }),
];

export default (): Configuration => ({
  entry: './src/main',
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'cheap-module-source-map' : false,
  output: {
    publicPath: '/',
    assetModuleFilename: 'assets/[hash][ext]',
    filename: 'assets/[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: isDev
          ? {
              plugins: ['react-refresh/babel'],
            }
          : undefined,
      },
    ],
  },
  plugins: isDev ? [...plugins, new ReactRefreshWebpackPlugin()] : [...plugins],
  devServer: {
    historyApiFallback: true,
  },
});
