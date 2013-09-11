# sorted-union-stream

Get the union of two sorted streams

	npm install sorted-union-stream

## Usage

``` js
var union = require('sorted-union-stream');
var es = require('event-stream'); // npm install event-stream

// es.readArray converts an array into a stream
var sorted1 = es.readArray([0,10,24,42,43,50,55]);
var sorted2 = es.readArray([10,42,53,55,60]);

// combine the two streams into a single sorted stream
var u = union(sorted1, sorted2);

u.on('data', function(data) {
	console.log(data);
});
u.on('end', function() {
	console.log('no more data');
});
```

Running the above example will print

```
0
10
24
42
43
55
60
no more data
```

## Streaming objects

If you are streaming objects you should use a `compare` function as the third parameter.

* `compare(value1, value2)` should return `0` if the values are equal.
* `compare(value1, value2)` should return `< 0` if value1 is smaller than value2.
* `compare(value1, value2)` should return `> 0` if value1 is larger than value2.

``` js
var sorted1 = es.readArray([{key:'a'}, {key:'b'}, {key:'c'}]);
var sorted2 = es.readArray([{key:'b'}, {key:'d'}]);

var u = union(sorted1, sorted2, function(value1, value2) {
	return value1.key.localeCompare(value2.key); // the key property is sorted
});

union.on('data', function(data) {
	console.log(data);
});
```

Running the above will print

```
{key:'a'}
{key:'b'}
{key:'c'}
{key:'d'}
```

## License

MIT
