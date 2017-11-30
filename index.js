'use strict';

var SVGSpriter = require('svg-sprite'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    glob = require('glob'),
    _ = require('lodash');


function SVGSprites(options) {
    this.options = options || {};
}


SVGSprites.prototype.apply = function (compiler) {

    var self = this;

    compiler.plugin('compile', function () {

        for (var bundle in self.options['sprites_conf']) {
            var retfunc = function (bundle, local_conf) {
                return function (err, files) {

                    let local_conf = _.merge(self.options, self.options['sprites_conf'][bundle]);
                    let spriter = new SVGSpriter(local_conf)

                    files.forEach(function (file) {
                        // Create and add file instance for each SVG
                        spriter.add(path.resolve(file), file, fs.readFileSync(path.resolve(file), {encoding: 'utf-8'}));
                    });

                    // Compile the sprite
                    spriter.compile(function (error, result, data) {
                        for (var mode in result) {
                            for (var type in result[mode]) {
                                mkdirp.sync(path.dirname(result[mode][type].path));
                                fs.writeFileSync(result[mode][type].path, result[mode][type].contents);
                            }
                        }

                    });
                }
            }

            glob.glob(self.options.src + bundle + '**/*.svg', retfunc(bundle))
        }
        ;
    });

}

module.exports = SVGSprites;