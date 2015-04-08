var StreamSet = require('./lib/sorted-stream-set.js')
var util = require('util')

var Union = function (a, b, toKey) {
  if (!(this instanceof Union)) return new Union(a, b, toKey)
  StreamSet.call(this, a, b, toKey)
}

util.inherits(Union, StreamSet)

Union.prototype._read = function () {
  var self = this
  this._readA(function (valA, keyA, consumeA) {
    self._readB(function (valB, keyB, consumeB) {
      if (!valA && !valB) return self.push(null)

      if (!valA) {
        consumeB()
        return self.push(valB)
      }

      if (!valB) {
        consumeA()
        return self.push(valA)
      }

      if (keyA === keyB) {
        consumeB()
        return self._read()
      }

      if (keyA < keyB) {
        consumeA()
        return self.push(valA)
      }

      consumeB()
      self.push(valB)
    })
  })
}

module.exports = Union