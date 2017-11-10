const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const path = require('path');

const basename = process.env.BASENAME || '/';
const production = process.env.NODE_ENV === 'production';
const modulesPath = path.resolve(__dirname, 'node_modules');
const outputPath = path.resolve(__dirname, 'dist');
const srcPath = path.resolve(__dirname, 'src');

const version = (() => {
  let version;
  if (fs.existsSync('.git')) {
    /* Get version from the repo commit count */
    const childProcess = require('child_process'); // eslint-disable-line global-require
    let commitCount;
    try {
      commitCount = parseInt(childProcess.execSync('git rev-list HEAD --count').toString(), 10);
    } catch (e) {
      commitCount = 0;
    }
    version = `${Math.floor(commitCount / 1000)}.${Math.floor(commitCount / 10) % 100}.${commitCount % 10}`;
  } else {
    /* Failover to package.json version */
    try {
      // eslint-disable-next-line prefer-destructuring
      version = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'))).version;
    } catch (e) {
      version = '0.0.0';
    }
  }
  return `v${version}`;
})();

module.exports = {
  devtool: production ? 'cheap-module-source-map' : 'eval-source-map',
  entry: srcPath,
  output: {
    path: outputPath,
    filename: `static/${(production ? '[hash].js' : '[name].js')}`,
    publicPath: basename,
  },
  resolve: {
    modules: [srcPath, modulesPath],
    extensions: ['.js', '.json', '.sass'],
  },
  module: {
    rules: [
      /* Transpile JS source */
      {
        test: /\.js$/,
        include: [
          srcPath,
          path.join(modulesPath, 'gl-matrix'),
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                ['env', { modules: false }],
                'stage-2',
              ],
            },
          },
        ],
      },
      /* Compile styles */
      {
        test: /\.sass$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                localIdentName: '[name]__[local]___[hash:base64:5]',
                modules: true,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [autoprefixer({ browsers: ['last 2 versions'] })],
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'compressed',
                sourceMap: true,
              },
            },
          ],
        }),
      },
      /* Inline shaders */
      {
        test: /\.(frag|vert)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'webpack-glsl-loader',
          },
        ],
      },
      /* Bundle images */
      {
        test: /\.(gif|jpg|png)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: `static/${(production ? '[hash].[ext]' : '[name].[ext]')}`,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(production ? 'production' : 'development'),
      },
      __BASENAME__: JSON.stringify(basename.substr(0, basename.length - 1)),
      __DEVELOPMENT__: !production,
      __PRODUCTION__: production,
      __VERSION__: JSON.stringify(version),
    }),
    new ExtractTextPlugin({
      allChunks: true,
      filename: 'static/[hash].css',
      disable: !production,
    }),
    new HtmlWebpackPlugin({
      devServer: !production ? ' ws://localhost:8080' : '',
      template: path.join(srcPath, 'index.ejs'),
      minify: {
        collapseWhitespace: true,
      },
    }),
  ].concat(!production ? [
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ] : [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true,
      },
      sourceMap: true,
    }),
  ]),
};
