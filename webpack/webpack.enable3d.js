const path = require('path')
/**
 * Makes the minified bundle
 */
module.exports = (env, argv) => {
  return {
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, './src/bundle.ts'),
    output: {
      filename: `enable3d@${argv.packageVersion}.min.js`,
      path: path.resolve(__dirname, `${argv.path}`),
      library: 'ENABLE3D',
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    externals: {
      phaser: 'Phaser'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader'
        }
      ]
    }
  }
}
