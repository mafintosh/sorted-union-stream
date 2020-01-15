# sorted-union-stream

Get the union of two sorted streams

```
npm install sorted-union-stream
```

[![build status](https://secure.travis-ci.org/mafintosh/sorted-union-stream.png)](http://travis-ci.org/mafintosh/sorted-union-stream)

## Usage

``` js
const union = require('sorted-union-stream')
const { Readable } = require('streamx')

// from converts an array into a stream
const sorted1 = Readable.from([1, 10, 24, 42, 43, 50, 55])
const sorted2 = Readable.from([10, 42, 53, 55, 60])

// combine the two streams into a single sorted stream
const u = new Union(sorted1, sorted2)

u.on('data', function(data) {
  console.log(data)
})
u.on('end', function() {
  console.log('no more data')
})
```

Running the above example will print

```
1
10
24
42
43
50
53
55
60
no more data
```

## Streaming objects

If you are streaming objects sorting is based on the compare function you can pass as the 3rd argument.

``` js
const sorted1 = Readable.from([{ foo:'a' }, { foo:'b' }, { foo:'c' }])
const sorted2 = Readable.from([{ foo:'b' }, { foo:'d' }])

const u = new Union(sorted1, sorted2, function(a, b) {
  return a.foo < b.foo ? -1 : a.foo > b.foo ? 1 : 0 
})

union.on('data', function(data) {
  console.log(data)
})
```

Running the above will print

``` js
{ foo: 'a' }
{ foo: 'b' }
{ foo: 'c' }
{ foo: 'd' }
```

## License

MIT
