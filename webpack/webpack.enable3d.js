const path = require('path')
/**
 * Makes the minified bundle
 */
module.exports = (env, argv) => {
  console.log(path.resolve(__dirname, `${argv.path}`))
  console.log(`enable3d.phaser@${argv.packageVersion}.min.js`)
  return {
    mode: 'production',
    devtool: 'source-map',
    entry: path.resolve(__dirname, '../packages/enable3d/src/index.ts'),
    output: {
      filename: `enable3d.phaser@${argv.packageVersion}.min.js`,
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
