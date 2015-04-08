var SetStream = require('sorted-set-stream')

var defaultKey = function (val) {
  return val.key || val
}

module.exports = function (a, b, opts) {
  var stream = SetStream(a, b)
  if (!opts) opts = {}

  function toKey (val) {
    if (!val) return
    if (!opts.toKey) opts.toKey = defaultKey
    return opts.toKey(val)
  }

  stream.next = function (err, dataA, dataB, nextA, nextB) {
    var self = this

    var vals = {a: dataA, b: dataB}
    var keys = {a: toKey(dataA), b: toKey(dataB)}

    if (!vals.a && !vals.b) return self.push(null)

    if (!vals.a) {
      nextB()
      return self.push(vals.b)
    }

    if (!vals.b) {
      nextA()
      return self.push(vals.a)
    }

    if (keys.a === keys.b) {
      nextB()
      return self._read()
    }

    if (keys.a < keys.b) {
      nextA()
      return self.push(vals.a)
    }

    nextB()
    self.push(vals.b)
  }
  return stream
}