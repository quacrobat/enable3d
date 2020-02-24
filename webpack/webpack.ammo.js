const path = require('path')

/**
 * Makes the minified bundle
 */
module.exports = (env, argv) => {
  return {
    mode: 'production',
    entry: path.resolve(__dirname, '../packages/ammo/dist/index.js'),
    output: {
      filename: `enable3d-ammo@${argv.packageVersion}.min.js`,
      path: path.resolve(__dirname, '../bundles'),
      library: 'AMMO',
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['.ts', '.js']
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
