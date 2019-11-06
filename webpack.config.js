const webpack = require('webpack');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
  entry: {
    bundle: ['./src/client/main.js']
  },
  resolve: {
    extensions: ['.mjs', '.js', '.svelte']
  },
  output: {
    path: __dirname + '/public',
    filename: '[name].js',
    chunkFilename: '[name].[id].js'
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            hotReload: true
          }
        }
      },
      {
        test: /\.css$/,
        use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  mode,
  plugins: [
    new webpack.EnvironmentPlugin({
      'ORBS_NODE_ADDRESS': process.env.ORBS_NODE_ADDRESS,
      'ORBS_VCHAIN': process.env.ORBS_VCHAIN,
      'ORBS_PRISM_URL': process.env.ORBS_PRISM_URL,
      'ORBS_IDENTITY': process.env.ORBS_IDENTITY,
    })
  ],
  devtool: prod ? false : 'source-map',
  devServer: {
    before: (app, server) => {
      require("./src/app")(app);
    }
  }
};
