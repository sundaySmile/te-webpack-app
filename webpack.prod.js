const webpack = require('webpack');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports = Merge(CommonConfig, {
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    //resolve-url-loader may be chained before sass-loader if necessary
                    use: ['css-loader', 'sass-loader']
                })
            }
        ]
    },
  plugins: [
      // extractCSS,
    new webpack.BannerPlugin('Created at ' + new Date()),
    new CleanWebpackPlugin(['dist/*']),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor-[hash].min.js'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
      allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin({})
    // new UglifyJSPlugin({
    //   compress: {
    //       warnings: true
    //   }
    // }),
    // new webpack.LoaderOptionsPlugin({
    //  minimize: true
    // })
  ]

});
