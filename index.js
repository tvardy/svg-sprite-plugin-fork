const path = require('path')
const fs = require('fs')

const mkdirp = require('mkdirp')
const glob = require('glob')
const SVGSpriter = require('svg-sprite')

function SVGSprites(options) {
  this.options = options || {}
}

SVGSprites.prototype.apply = function (compiler) {
  function _process(bundle, {log, src}) {
    return function (err, files) {
      if (err) {
        throw err
      }

      const config = Object.assign({}, {log, src}, bundle)
      const spriter = new SVGSpriter(config)

      files.forEach(file => {
        // Create and add file instance for each SVG
        spriter.add(path.resolve(file), file, fs.readFileSync(path.resolve(file), {encoding: 'utf-8'}))
      })

      // Compile the sprite
      spriter.compile((error, result) => {
        Object.keys(result).forEach(mode => {
          Object.keys(result[mode]).forEach(type => {
            const data = result[mode][type]

            mkdirp.sync(path.dirname(data.path))
            fs.writeFileSync(data.path, data.contents)
          })
        })
      })
    }
  }

  compiler.plugin('compile', () => {
    Object.keys(this.options.bundles).forEach(key => {
      glob.glob(`${this.options.src || ''}${key}/**/*.svg'`, _process(this.options.bundles[key], this.options))
    })
  })
}

module.exports = SVGSprites
