const path = require('path');

module.exports = {
  mode: 'development',
  entry: './public/js/main.js', // The entry point of your renderer process script
  target: 'electron-renderer',
  output: {
    filename: 'renderer.bundle.js', // Output bundle file
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/, // Targeting JavaScript files
        exclude: /node_modules/, // Excluding the node_modules directory
        use: {
          loader: 'babel-loader', // Using Babel loader to transpile modern JavaScript
          options: {
            presets: ['@babel/preset-env'], // Using the env preset to transpile JS
          },
        },
      },
    ],
  },
};
