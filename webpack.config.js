const webpack = require('webpack'),
    path = require('path'),
    fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");



const distPath = path.join(__dirname + '/docs');
const srcPath = path.join(__dirname + '/src');


const requiredDirectorys = ['font', 'style', 'js', 'assets'];
requiredDirectorys.forEach(dirName => {
    const dirPath = path.join(srcPath, dirName);
    !fs.existsSync(dirPath) && fs.mkdirSync(dirPath);
});



const htmlFiles = fs.readdirSync(srcPath).filter(fileName => path.extname(fileName) === '.html');

const plugins = [];
htmlFiles.forEach(fileName => {
    plugins.push(new HtmlWebpackPlugin({
        filename: fileName,
        template: path.join(srcPath, fileName)
    }));
});

const cssFileName = process.env.NODE_ENV === 'production' ? 'style/[name].css' : 'style/[name].[contenthash].css';
const extractSass = new ExtractTextPlugin(cssFileName);


plugins.push(extractSass);
plugins.push(new webpack.DefinePlugin({
    app: {
        environment: JSON.stringify(process.env.APP_ENVIRONMENT || 'development')
    }
}));

if (process.env.NODE_ENV === 'production') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compressor: { warnings: false }
    }));
}
const config = {
    entry: {
        modules: path.join(srcPath, '/module.js'),
        app: path.join(srcPath, '/index.js')
    },
    output: {
        path: distPath,
        publicPath: '',
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(scss|css)$/,
                use: extractSass.extract(['css-loader?minimize=true', 'resolve-url-loader', 'sass-loader']),
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|otf)$/,
                loaders: [
                    'url-loader?limit=10000&name=assets/font/[name].[ext]',
                ]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        name: 'assets/imgs/[name].[ext]'
                    }
                }]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.html', '.css', 'scss']
    },
    devServer: {
        contentBase: path.join(__dirname, "src")
    },
    plugins: plugins
};
console.log('curreunt mode : ', process.env.NODE_ENV + ' mode');

module.exports = config;