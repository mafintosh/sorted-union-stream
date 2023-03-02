const { Readable } = require('streamx')

module.exports = class SortedUnionStream extends Readable {
  constructor (left, right, opts) {
    super()

    if (typeof opts === 'function') opts = { compare: opts }
    if (!left.destroy || !right.destroy) throw new Error('Only modern stream supported')

    this.left = new Peaker(left)
    this.right = new Peaker(right)
    this.compare = (opts && opts.compare) || defaultCompare

    this._missing = 2
    this._onclose = null
    this._both = !!(opts && opts.both)
    this._map = (opts && opts.map) || defaultMap

    this._track(left)
    this._track(right)
  }

  _read (cb) {
    const self = this

    this.left.read(function (err, l) {
      if (err) return cb(err)
      self.right.read(function (err, r) {
        if (err) return cb(err)
        self._readBoth(l, r, cb)
      })
    })
  }

  _readBoth (l, r, cb) {
    if (l === null && r === null) {
      this.push(null)
      return cb(null)
    }

    if (l === null) {
      this._push(null, r, cb)
      return
    }
    if (r === null) {
      this._push(l, null, cb)
      return
    }

    const cmp = this.compare(l, r)

    if (cmp === 0) {
      this._push(l, r, cb)
      return
    }

    if (cmp < 0) this._push(l, null, cb)
    else this._push(null, r, cb)
  }

  _push (l, r, cb) {
    const data = this._map(l, r)
    const pushed = this.push(data)

    if (this._both && l && r) this.push(data)

    if (l !== null) this.left.consume()
    if (r !== null) this.right.consume()

    if (pushed) cb(null)
    else this._read(cb)
  }

  _predestroy () {
    this.left.stream.destroy()
    this.right.stream.destroy()
  }

  _destroy (cb) {
    if (!this.missing) return cb(null)
    this._onclose = cb
  }

  _track (stream) {
    const self = this
    let closed = false

    stream.on('error', onclose)
    stream.on('close', onclose)

    function onclose (err) {
      if (err && typeof err === 'object') self.destroy(err)
      if (closed) return
      closed = true
      if (!--self._missing && self._onclose) self._onclose()
    }
  }
}

class Peaker {
  constructor (stream) {
    this.stream = stream
    this.stream.on('readable', this._onreadable.bind(this))
    this.stream.on('end', this._onend.bind(this))
    this.value = null
    this._reading = null
    this._ended = false
  }

  read (cb) {
    if (this.value) return cb(null, this.value)
    this._reading = cb
    this._onreadable()
  }

  consume () {
    this.value = null
  }

  _onend () {
    this._ended = true
    this._onreadable()
  }

  _onreadable () {
    if (this.value) return
    this.value = this.stream.read()
    if ((this.value !== null || this._ended) && this._reading) {
      const cb = this._reading
      this._reading = null
      cb(null, this.value)
    }
  }
}

function defaultCompare (a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function defaultMap (a, b) {
  return a === null ? b : a
}
