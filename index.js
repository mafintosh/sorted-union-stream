var SetStream = require('sorted-set-stream')
var util = require('util')


module.exports = function (a, b, toKey) {
  var stream = SetStream(a, b, toKey)
  stream.next = function (keys, vals, consumes) {
    var self = this
    if (!vals || (!vals.a && !vals.b)) return self.push(null)

    if (!vals.a) {
      consumes.b()
      return self.push(vals.b)
    }

    if (!vals.b) {
      consumes.a()
      return self.push(vals.a)
    }

    if (keys.a === keys.b) {
      consumes.b()
      return self._read()
    }

    if (keys.a < keys.b) {
      consumes.a()
      return self.push(vals.a)
    }

    consumes.b()
    self.push(vals.b)
  }
  return stream
}