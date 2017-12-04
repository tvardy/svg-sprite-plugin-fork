const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const glob = require('glob')
const SVGSpriter = require('svg-sprite')

function SVGSprites(options) {
  this.options = options || {}
}

SVGSprites.prototype.apply = function (compiler) {
  function _process(bundle, {log, src, dest}) {
    return function (err, files) {
      if (err) {
        throw err
      }

      const config = Object.assign({}, {log, src}, bundle)
      const spriter = new SVGSpriter(config)

      files.forEach(file => {
        // Create and add file instance for each SVG
        spriter.add(path.resolve(file), null, fs.readFileSync(path.resolve(file), {encoding: 'utf-8'}))
      })

      // Compile the sprite
      spriter.compile((err, result) => {
        if (err) {
          throw err
        }

        Object.keys(result).forEach(mode => {
          const _dest = path.resolve(compiler.outputPath, dest, mode)
          mkdirp.sync(_dest)

          Object.keys(result[mode]).forEach(type => {
            const data = result[mode][type]
            fs.writeFileSync(path.join(_dest, path.parse(data.path).base), data.contents)
          })
        })
      })
    }
  }

  compiler.plugin('compile', () => {
    Object.keys(this.options.bundles).forEach(key => {
      glob(`${this.options.src || ''}${key}/**/*.svg`, { stat: true }, _process(this.options.bundles[key], this.options))
    })
  })
}

module.exports = SVGSprites
