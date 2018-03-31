const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    entry: {
        main: ["./src/js/index.js"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    resolve: {
        extensions: [".ts", ".css", ".js"],
        modules: [resolve("src"), resolve("node_modules")]
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(glsl)(\?.*)?$/,
                loader: "webpack-glsl-loader"
            },
            {
                test: /\.(js)$/,
                loader: "eslint-loader",
                enforce: "pre",
                exclude: /node_modules/,
                options: { formatter: require("eslint-friendly-formatter") }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["es2015"]
                    }
                }
            },
            // {
            //     test: /\.html$/,
            //     use: [
            //         {
            //             loader: "file-loader"
            //             options: {
            //                 name: "[name].html"
            //             }
            //         },
            //         {
            //             loader: "extract-loader"
            //         },
            //         {
            //             loader: "html-loader",
            //             options: {
            //                 attrs: ["img:src"]
            //             }
            //         }
            //     ]
            // },
            // {
            //     test: /\.(png|jpg|jpeg|gif|svg)$/,
            //     use: {
            //         loader: "fill-loader",
            //         options: {
            //             limit: 1,
            //             name: "assets/img/[name].[hash:7].[ext]"
            //         }
            //     }
            // },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 1,
                        name: "assets/img/[name].[hash:7].[ext]"
                    }
                }
            },
            {
                test: /\.(mp4|mp3|m3u8|ts)(\?.*)?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        limit: 1,
                        name: "assets/video/[name].[hash:7].[ext]"
                    }
                }
            }
        ]
    },
    devtool: "inline-source-map",
    plugins: [
        new HtmlWebpackPlugin({
            title: "Development",
            filename: "index.html",
            template: path.resolve(__dirname, "src/index.html"),
            chunksSortMode: "dependency"
        }),
        new webpack.HotModuleReplacementPlugin(),
        new CopyWebpackPlugin([
            {
                from: __dirname + "/src/static",
                to: __dirname + "/dist/static"
            }
        ])
    ]
};
