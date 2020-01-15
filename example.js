const Union = require('./')
const { Readable } = require('streamx')

const sorted1 = Readable.from([{ key: 'a' }, { key: 'b' }, { key: 'c' }])
const sorted2 = Readable.from([{ key: 'b' }, { key: 'd' }])

const u = new Union(sorted1, sorted2)

u.on('data', function (data) {
  console.log(data)
})

u.on('end', function () {
  console.log('no more data')
})
