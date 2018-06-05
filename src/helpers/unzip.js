const extractZip = require('extract-zip')
const path = require('path')

module.exports = function(from, to, size) {
  return new Promise(resolve => {
    extractZip(from, { dir: path.resolve(to, '..') }, resolve)
  })
}
