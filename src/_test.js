const R = require('.')

const a = R.value(3)
a._node._id = "a"

const b = R.value(5)
b._node._id = "b"
const c = R.value(7)
c._node._id = "c"
const d = R.value(9)
d._node._id = "d"

const ab = R.computed(() => a.get() + b.get())
ab._node._id = "ab"
const cd = R.computed(() => c.get() + d.get())
cd._node._id = "cd"

const abcd = R.computed(() => ab.get() + cd.get())
abcd._node._id = "abcd"

const r = R.reaction(() => { console.log({ abcd: abcd.get() }) })
r._node._id = "r"
r.subscribe()

module.exports = { R, a, b, c, d, ab, cd, abcd, r }
