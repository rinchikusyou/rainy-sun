const path = require('path')
const fs = require('fs')

module.exports = (imgName) => new Promise((resolve, reject) => {
  return fs.rm(path.resolve(__dirname, "..", "static", imgName), (err) => {
    if (err) {
      return reject(err)
    }
    resolve();
  })

})