const webpack = require('webpack');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');

module.exports = Merge(CommonConfig, {
  devtool: 'cheap-module-source-map',
  // NODE_ENV: '"development"',
  devServer: {
    contentBase: './dist',
    port: 8086,
    host: '0.0.0.0',
    historyApiFallback: true,
    disableHostCheck: true,
    noInfo: false,
    stats: 'minimal',
    compress: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    })
  ]
});