import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

module.exports = {
  entry: './src/index.js', // Adjust the entry point according to your project structure
  output: {
    filename: 'bundle.min.js',
    path: __dirname + '/build',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    ],
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true,
    }),
  ],
};
