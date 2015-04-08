var util = require('util')
var Readable = require('readable-stream').Readable

var stream2 = function (stream) {
  if (stream._readableState) return stream
  return new Readable({objectMode: true, highWaterMark: 16}).wrap(stream)
}

var destroy = function (stream) {
  if (stream.readable && stream.destroy) stream.destroy()
}

var defaultKey = function (val) {
  return val.key || val
}

var reader = function (self, stream, toKey) {
  stream = stream2(stream)

  var ended = false
  var data = null
  var key = null
  var fn

  var consume = function () {
    data = null
    key = null
  }

  var onresult = function () {
    if (!fn) return
    var tmp = fn
    fn = undefined
    tmp(data, key, consume)
  }

  var update = function () {
    if (!fn) return
    data = stream.read()
    if (data === null && !ended) return
    key = toKey(data)
    onresult()
  }

  var onend = function () {
    ended = true
    onresult()
  }

  stream.on('readable', update)

  stream.on('error', function (err) {
    self.destroy(err)
  })

  stream.on('close', function () {
    if (stream._readableState.ended) return
    onend()
  })

  stream.on('end', onend)

  return function (callback) {
    if (data) return callback(data, key, consume)
    if (ended) return callback(null, null, consume)
    fn = callback
    update()
  }
}

var StreamSet = function (a, b, toKey) {
  if (!(this instanceof StreamSet)) return new StreamSet(a, b, toKey)
  Readable.call(this, {objectMode: true, highWaterMark: 16})
  if (!toKey) toKey = defaultKey

  this._destroyed = false
  this._a = a
  this._b = b

  this._readA = reader(this, a, toKey)
  this._readB = reader(this, b, toKey)
}

util.inherits(StreamSet, Readable)

StreamSet.prototype._read = function () {
  var self = this
  console.error('_read unimplemented!')
  this.emit('error', new Error('Must implement _read'))
}

StreamSet.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true
  destroy(this._a)
  destroy(this._b)
  if (err) this.emit('error', err)
  this.emit('close')
}

module.exports = StreamSet
