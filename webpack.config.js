const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                          // only enable hot in development
                          hmr: true,
                          // if hmr does not work, this is a forceful method.
                          reloadAll: true,
                        },
                    },
                    'css-loader',
                    'postcss-loader',
                ]
            }
        ]
    },
    resolve: { extensions: ["*", ".js", ".jsx"] },
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        port: 3000,
        hotOnly: true,
    }
}