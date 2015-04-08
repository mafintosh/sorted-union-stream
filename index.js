var SetStream = require('sorted-set-stream')
var util = require('util')

var Union = function (a, b, toKey) {
  if (!(this instanceof Union)) return new Union(a, b, toKey)
  SetStream.call(this, a, b, toKey)
}

util.inherits(Union, SetStream)

Union.prototype.setFunction = function (keys, vals, consumes) {
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

module.exports = Union